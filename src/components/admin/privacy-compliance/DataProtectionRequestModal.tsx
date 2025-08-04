'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface DataProtectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestData: any) => void;
  request?: any;
  mode: 'create' | 'edit' | 'view';
}

export function DataProtectionRequestModal({
  isOpen,
  onClose,
  onSubmit,
  request,
  mode = 'create',
}: DataProtectionRequestModalProps) {
  const [formData, setFormData] = useState({
    userId: request?.userId || '',
    userName: request?.userName || '',
    userEmail: request?.userEmail || '',
    type: request?.type || 'access',
    priority: request?.priority || 'medium',
    description: request?.description || '',
    dataTypes: request?.dataTypes || [],
    legalBasis: request?.legalBasis || '',
    processingNotes: request?.processingNotes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    toast.success(
      `Request ${mode === 'create' ? 'created' : 'updated'} successfully`
    );
  };

  const dataTypeOptions = [
    'profile',
    'learning_progress',
    'communications',
    'assessments',
    'user_files',
    'certificates',
    'payment_info',
    'login_history',
  ];

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? 'New Data Protection Request'
              : mode === 'edit'
                ? 'Edit Request'
                : 'Request Details'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new data protection request'
              : mode === 'edit'
                ? 'Update the data protection request'
                : 'View data protection request details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>User ID</Label>
              <Input
                value={formData.userId}
                onChange={e =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                placeholder="Enter user ID"
                readOnly={isReadOnly}
                className="mt-1"
              />
            </div>

            <div>
              <Label>User Email</Label>
              <Input
                type="email"
                value={formData.userEmail}
                onChange={e =>
                  setFormData({ ...formData, userEmail: e.target.value })
                }
                placeholder="user@example.com"
                readOnly={isReadOnly}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Request Type</Label>
              <Select
                value={formData.type}
                onValueChange={value =>
                  setFormData({ ...formData, type: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="access">Access Request</SelectItem>
                  <SelectItem value="rectification">Rectification</SelectItem>
                  <SelectItem value="erasure">
                    Erasure (Right to be Forgotten)
                  </SelectItem>
                  <SelectItem value="portability">Data Portability</SelectItem>
                  <SelectItem value="restriction">
                    Restriction of Processing
                  </SelectItem>
                  <SelectItem value="objection">
                    Objection to Processing
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={value =>
                  setFormData({ ...formData, priority: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the data protection request..."
              rows={3}
              readOnly={isReadOnly}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Data Types Involved</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {dataTypeOptions.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={type}
                    checked={formData.dataTypes.includes(type)}
                    onChange={e => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          dataTypes: [...formData.dataTypes, type],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          dataTypes: formData.dataTypes.filter(
                            (t: string) => t !== type
                          ),
                        });
                      }
                    }}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor={type} className="text-sm capitalize">
                    {type.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Legal Basis</Label>
            <Select
              value={formData.legalBasis}
              onValueChange={value =>
                setFormData({ ...formData, legalBasis: value })
              }
              disabled={isReadOnly}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select legal basis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Article 15 - Right of access">
                  Article 15 - Right of access
                </SelectItem>
                <SelectItem value="Article 16 - Right to rectification">
                  Article 16 - Right to rectification
                </SelectItem>
                <SelectItem value="Article 17 - Right to erasure">
                  Article 17 - Right to erasure
                </SelectItem>
                <SelectItem value="Article 20 - Right to data portability">
                  Article 20 - Right to data portability
                </SelectItem>
                <SelectItem value="Article 18 - Right to restriction">
                  Article 18 - Right to restriction
                </SelectItem>
                <SelectItem value="Article 21 - Right to object">
                  Article 21 - Right to object
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode !== 'create' && (
            <div>
              <Label>Processing Notes</Label>
              <Textarea
                value={formData.processingNotes}
                onChange={e =>
                  setFormData({ ...formData, processingNotes: e.target.value })
                }
                placeholder="Add processing notes..."
                rows={3}
                readOnly={isReadOnly}
                className="mt-1"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button type="submit">
                {mode === 'create' ? 'Create Request' : 'Update Request'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
