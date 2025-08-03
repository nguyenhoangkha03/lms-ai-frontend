'use client';

import { EventEmitter } from 'events';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  enableAudio: boolean;
  enableVideo: boolean;
  videoConstraints: MediaStreamConstraints['video'];
  audioConstraints: MediaStreamConstraints['audio'];
}

export interface PeerConnection {
  id: string;
  userId: string;
  connection: RTCPeerConnection;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  dataChannel?: RTCDataChannel;
  isInitiator: boolean;
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
}

export interface ConnectionStats {
  bandwidth: number;
  packetLoss: number;
  latency: number;
  jitter: number;
  audioLevel: number;
  videoQuality: 'low' | 'medium' | 'high';
}

export class WebRTCConnectionManager extends EventEmitter {
  private config: WebRTCConfig;
  private localStream: MediaStream | null = null;
  private peers: Map<string, PeerConnection> = new Map();
  private sessionId: string;
  private userId: string;
  private isScreenSharing: boolean = false;
  private screenStream: MediaStream | null = null;
  private statsInterval: NodeJS.Timeout | null = null;

  constructor(
    sessionId: string,
    userId: string,
    config?: Partial<WebRTCConfig>
  ) {
    super();
    this.sessionId = sessionId;
    this.userId = userId;
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
      enableAudio: true,
      enableVideo: true,
      videoConstraints: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
      audioConstraints: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      ...config,
    };

    // Start periodic stats collection
    this.startStatsCollection();
  }

  // Initialize local media stream
  async initializeLocalStream(): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: this.config.enableAudio ? this.config.audioConstraints : false,
        video: this.config.enableVideo ? this.config.videoConstraints : false,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      this.emit('localStreamReady', this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      this.emit('error', { type: 'media_access', error });
      throw error;
    }
  }

  // Create peer connection
  async createPeerConnection(
    peerId: string,
    userId: string,
    isInitiator: boolean = false
  ): Promise<PeerConnection> {
    const peerConnection = new RTCPeerConnection({
      iceServers: this.config.iceServers,
    });

    const peer: PeerConnection = {
      id: peerId,
      userId,
      connection: peerConnection,
      localStream: this.localStream || undefined,
      isInitiator,
      connectionState: peerConnection.connectionState,
      iceConnectionState: peerConnection.iceConnectionState,
    };

    // Set up event listeners
    this.setupPeerConnectionListeners(peer);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Create data channel for metadata
    if (isInitiator) {
      peer.dataChannel = peerConnection.createDataChannel('metadata', {
        ordered: true,
      });
      this.setupDataChannelListeners(peer);
    } else {
      peerConnection.ondatachannel = event => {
        peer.dataChannel = event.channel;
        this.setupDataChannelListeners(peer);
      };
    }

    this.peers.set(peerId, peer);
    this.emit('peerConnected', peer);

    return peer;
  }

  // Setup peer connection event listeners
  private setupPeerConnectionListeners(peer: PeerConnection): void {
    const { connection } = peer;

    connection.onicecandidate = event => {
      if (event.candidate) {
        this.emit('iceCandidate', {
          peerId: peer.id,
          candidate: event.candidate,
        });
      }
    };

    connection.ontrack = event => {
      peer.remoteStream = event.streams[0];
      this.emit('remoteStreamReceived', {
        peerId: peer.id,
        stream: event.streams[0],
      });
    };

    connection.onconnectionstatechange = () => {
      peer.connectionState = connection.connectionState;
      this.emit('connectionStateChange', {
        peerId: peer.id,
        state: connection.connectionState,
      });

      if (
        connection.connectionState === 'failed' ||
        connection.connectionState === 'disconnected'
      ) {
        this.handlePeerDisconnection(peer.id);
      }
    };

    connection.oniceconnectionstatechange = () => {
      peer.iceConnectionState = connection.iceConnectionState;
      this.emit('iceConnectionStateChange', {
        peerId: peer.id,
        state: connection.iceConnectionState,
      });
    };

    connection.onnegotiationneeded = async () => {
      if (peer.isInitiator) {
        try {
          const offer = await connection.createOffer();
          await connection.setLocalDescription(offer);
          this.emit('offer', {
            peerId: peer.id,
            offer: offer,
          });
        } catch (error) {
          console.error('Error creating offer:', error);
          this.emit('error', {
            type: 'offer_creation',
            error,
            peerId: peer.id,
          });
        }
      }
    };
  }

  // Setup data channel listeners
  private setupDataChannelListeners(peer: PeerConnection): void {
    if (!peer.dataChannel) return;

    peer.dataChannel.onopen = () => {
      this.emit('dataChannelOpen', { peerId: peer.id });
    };

    peer.dataChannel.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        this.emit('dataChannelMessage', {
          peerId: peer.id,
          data,
        });
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };

    peer.dataChannel.onerror = error => {
      console.error('Data channel error:', error);
      this.emit('error', { type: 'data_channel', error, peerId: peer.id });
    };
  }

  // Handle SDP offer
  async handleOffer(
    peerId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) {
      console.error('Peer not found for offer:', peerId);
      return;
    }

    try {
      await peer.connection.setRemoteDescription(offer);
      const answer = await peer.connection.createAnswer();
      await peer.connection.setLocalDescription(answer);

      this.emit('answer', {
        peerId,
        answer,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
      this.emit('error', { type: 'offer_handling', error, peerId });
    }
  }

  // Handle SDP answer
  async handleAnswer(
    peerId: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) {
      console.error('Peer not found for answer:', peerId);
      return;
    }

    try {
      await peer.connection.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
      this.emit('error', { type: 'answer_handling', error, peerId });
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(
    peerId: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) {
      console.error('Peer not found for ICE candidate:', peerId);
      return;
    }

    try {
      await peer.connection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      this.emit('error', { type: 'ice_candidate', error, peerId });
    }
  }

  // Toggle audio
  toggleAudio(enabled?: boolean): boolean {
    if (!this.localStream) return false;

    const audioTracks = this.localStream.getAudioTracks();
    const newState = enabled !== undefined ? enabled : !audioTracks[0]?.enabled;

    audioTracks.forEach(track => {
      track.enabled = newState;
    });

    this.emit('audioToggled', { enabled: newState });
    return newState;
  }

  // Toggle video
  toggleVideo(enabled?: boolean): boolean {
    if (!this.localStream) return false;

    const videoTracks = this.localStream.getVideoTracks();
    const newState = enabled !== undefined ? enabled : !videoTracks[0]?.enabled;

    videoTracks.forEach(track => {
      track.enabled = newState;
    });

    this.emit('videoToggled', { enabled: newState });
    return newState;
  }

  // Start screen sharing
  async startScreenShare(): Promise<MediaStream> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      // Replace video track in all peer connections
      const videoTrack = this.screenStream.getVideoTracks()[0];
      if (videoTrack) {
        for (const peer of this.peers.values()) {
          const sender = peer.connection
            .getSenders()
            .find(s => s.track && s.track.kind === 'video');
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }
      }

      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      this.isScreenSharing = true;
      this.emit('screenShareStarted', this.screenStream);
      return this.screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      this.emit('error', { type: 'screen_share_start', error });
      throw error;
    }
  }

  // Stop screen sharing
  async stopScreenShare(): Promise<void> {
    if (!this.isScreenSharing || !this.screenStream) return;

    try {
      // Stop screen share tracks
      this.screenStream.getTracks().forEach(track => track.stop());

      // Replace back to camera if available
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
          for (const peer of this.peers.values()) {
            const sender = peer.connection
              .getSenders()
              .find(s => s.track && s.track.kind === 'video');
            if (sender) {
              await sender.replaceTrack(videoTrack);
            }
          }
        }
      }

      this.screenStream = null;
      this.isScreenSharing = false;
      this.emit('screenShareStopped');
    } catch (error) {
      console.error('Error stopping screen share:', error);
      this.emit('error', { type: 'screen_share_stop', error });
    }
  }

  // Send data to all peers
  sendDataToAllPeers(data: any): void {
    const message = JSON.stringify(data);

    this.peers.forEach(peer => {
      if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
        try {
          peer.dataChannel.send(message);
        } catch (error) {
          console.error('Error sending data to peer:', peer.id, error);
        }
      }
    });
  }

  // Send data to specific peer
  sendDataToPeer(peerId: string, data: any): void {
    const peer = this.peers.get(peerId);
    if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
      console.warn('Cannot send data to peer:', peerId);
      return;
    }

    try {
      peer.dataChannel.send(JSON.stringify(data));
    } catch (error) {
      console.error('Error sending data to peer:', peerId, error);
    }
  }

  // Get connection statistics
  async getConnectionStats(
    peerId?: string
  ): Promise<Map<string, ConnectionStats>> {
    const statsMap = new Map<string, ConnectionStats>();

    const peersToCheck = peerId
      ? [this.peers.get(peerId)].filter(Boolean)
      : Array.from(this.peers.values());

    for (const peer of peersToCheck) {
      if (!peer) continue;

      try {
        const stats = await peer.connection.getStats();
        const connectionStats = this.parseRTCStats(stats);
        statsMap.set(peer.id, connectionStats);
      } catch (error) {
        console.error('Error getting stats for peer:', peer.id, error);
      }
    }

    return statsMap;
  }

  // Parse RTC stats
  private parseRTCStats(stats: RTCStatsReport): ConnectionStats {
    let bandwidth = 0;
    let packetLoss = 0;
    let latency = 0;
    let jitter = 0;
    let audioLevel = 0;
    let videoQuality: 'low' | 'medium' | 'high' = 'medium';

    stats.forEach(report => {
      if (report.type === 'inbound-rtp') {
        if (report.kind === 'video') {
          bandwidth = report.bytesReceived || 0;
          packetLoss =
            ((report.packetsLost || 0) / (report.packetsReceived || 1)) * 100;

          // Determine video quality based on resolution and frame rate
          const frameWidth = report.frameWidth || 0;
          const frameHeight = report.frameHeight || 0;
          const framesPerSecond = report.framesPerSecond || 0;

          if (
            frameWidth >= 1280 &&
            frameHeight >= 720 &&
            framesPerSecond >= 25
          ) {
            videoQuality = 'high';
          } else if (
            frameWidth >= 640 &&
            frameHeight >= 480 &&
            framesPerSecond >= 15
          ) {
            videoQuality = 'medium';
          } else {
            videoQuality = 'low';
          }
        }

        if (report.kind === 'audio') {
          audioLevel = report.audioLevel || 0;
          jitter = report.jitter || 0;
        }
      }

      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        latency = report.currentRoundTripTime || 0;
      }
    });

    return {
      bandwidth: bandwidth / 1024, // Convert to KB/s
      packetLoss,
      latency: latency * 1000, // Convert to milliseconds
      jitter: jitter * 1000, // Convert to milliseconds
      audioLevel,
      videoQuality,
    };
  }

  // Start periodic stats collection
  private startStatsCollection(): void {
    this.statsInterval = setInterval(async () => {
      if (this.peers.size > 0) {
        const stats = await this.getConnectionStats();
        this.emit('statsUpdate', stats);
      }
    }, 5000); // Collect stats every 5 seconds
  }

  // Handle peer disconnection
  private handlePeerDisconnection(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    // Close connections
    peer.connection.close();
    if (peer.dataChannel) {
      peer.dataChannel.close();
    }

    this.peers.delete(peerId);
    this.emit('peerDisconnected', { peerId });
  }

  // Get peer by ID
  getPeer(peerId: string): PeerConnection | undefined {
    return this.peers.get(peerId);
  }

  // Get all peers
  getAllPeers(): PeerConnection[] {
    return Array.from(this.peers.values());
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Get screen share stream
  getScreenStream(): MediaStream | null {
    return this.screenStream;
  }

  // Check if screen sharing
  isScreenSharingCheck(): boolean {
    return this.isScreenSharing;
  }

  // Get connection count
  getConnectionCount(): number {
    return this.peers.size;
  }

  // Cleanup and destroy all connections
  destroy(): void {
    // Clear stats interval
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    // Close all peer connections
    this.peers.forEach(peer => {
      peer.connection.close();
      if (peer.dataChannel) {
        peer.dataChannel.close();
      }
    });
    this.peers.clear();

    // Stop local streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    // Remove all listeners
    this.removeAllListeners();

    this.emit('destroyed');
  }

  // Update configuration
  updateConfig(config: Partial<WebRTCConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('configUpdated', this.config);
  }

  // Get current configuration
  getConfig(): WebRTCConfig {
    return { ...this.config };
  }

  // Check browser compatibility
  static checkCompatibility(): {
    supported: boolean;
    features: {
      getUserMedia: boolean;
      getDisplayMedia: boolean;
      RTCPeerConnection: boolean;
      RTCDataChannel: boolean;
    };
    limitations: string[];
  } {
    const features = {
      getUserMedia: !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ),
      getDisplayMedia: !!(
        navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia
      ),
      RTCPeerConnection: !!window.RTCPeerConnection,
      RTCDataChannel: !!window.RTCDataChannel,
    };

    const limitations: string[] = [];

    if (!features.getUserMedia) {
      limitations.push('Camera and microphone access not supported');
    }

    if (!features.getDisplayMedia) {
      limitations.push('Screen sharing not supported');
    }

    if (!features.RTCPeerConnection) {
      limitations.push('WebRTC peer connections not supported');
    }

    if (!features.RTCDataChannel) {
      limitations.push('WebRTC data channels not supported');
    }

    const supported = Object.values(features).every(Boolean);

    return {
      supported,
      features,
      limitations,
    };
  }
}

// Hook for using WebRTC connection manager
import { useEffect, useRef, useState } from 'react';

export function useWebRTCConnection(
  sessionId: string,
  userId: string,
  config?: Partial<WebRTCConfig>
) {
  const [connectionManager, setConnectionManager] =
    useState<WebRTCConnectionManager | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [connectionStats, setConnectionStats] = useState<
    Map<string, ConnectionStats>
  >(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize connection manager
  useEffect(() => {
    const manager = new WebRTCConnectionManager(sessionId, userId, config);
    setConnectionManager(manager);

    // Set up event listeners
    manager.on('localStreamReady', (stream: MediaStream) => {
      setLocalStream(stream);
    });

    manager.on(
      'remoteStreamReceived',
      ({ peerId, stream }: { peerId: string; stream: MediaStream }) => {
        setRemoteStreams(prev => new Map(prev).set(peerId, stream));
      }
    );

    manager.on('peerDisconnected', ({ peerId }: { peerId: string }) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(peerId);
        return newMap;
      });
    });

    manager.on('statsUpdate', (stats: Map<string, ConnectionStats>) => {
      setConnectionStats(stats);
    });

    manager.on('error', ({ type, error }: { type: string; error: any }) => {
      console.error(`WebRTC Error (${type}):`, error);
      setError(`${type}: ${error.message || error}`);
    });

    // Initialize local stream
    manager
      .initializeLocalStream()
      .then(() => {
        setIsInitialized(true);
        setError(null);
      })
      .catch(err => {
        setError(`Failed to initialize: ${err.message}`);
      });

    return () => {
      manager.destroy();
    };
  }, [sessionId, userId]);

  return {
    connectionManager,
    localStream,
    remoteStreams,
    connectionStats,
    isInitialized,
    error,
  };
}
