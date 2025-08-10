'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  Camera,
  Upload,
  Star,
  Award,
  BookOpen,
  Users,
  Clock,
  Globe,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface TeacherProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
  bio: string;
  title: string;
  specialization: string[];
  experience: number; // years
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    year: string;
    expiryDate?: string;
  }[];
  socialLinks: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  location: {
    country: string;
    city: string;
    timezone: string;
  };
  preferences: {
    language: string;
    currency: string;
    emailNotifications: boolean;
    profileVisibility: 'public' | 'private' | 'students_only';
  };
  stats: {
    totalStudents: number;
    totalCourses: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    joinedDate: string;
  };
  bankingInfo: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    routingNumber: string;
  };
  taxInfo: {
    taxId: string;
    businessName?: string;
    businessType: 'individual' | 'business';
  };
}

const mockTeacherProfile: TeacherProfile = {
  id: '1',
  firstName: 'Nguyễn',
  lastName: 'Văn Minh',
  email: 'nguyen.van.minh@email.com',
  phone: '+84 123 456 789',
  avatar: null,
  bio: 'Experienced software engineer and machine learning enthusiast with 8+ years in the industry. Passionate about teaching and sharing knowledge with the next generation of developers.',
  title: 'Senior Software Engineer & AI Researcher',
  specialization: ['Machine Learning', 'Python Programming', 'Data Science', 'Web Development'],
  experience: 8,
  education: [
    {
      degree: 'Master of Computer Science',
      institution: 'Vietnam National University',
      year: '2016',
    },
    {
      degree: 'Bachelor of Information Technology',
      institution: 'Ho Chi Minh University of Technology',
      year: '2014',
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Machine Learning Specialty',
      issuer: 'Amazon Web Services',
      year: '2023',
      expiryDate: '2026-03-15',
    },
    {
      name: 'Google Professional Machine Learning Engineer',
      issuer: 'Google Cloud',
      year: '2022',
      expiryDate: '2024-12-01',
    },
  ],
  socialLinks: {
    website: 'https://nguyenvanminh.dev',
    linkedin: 'https://linkedin.com/in/nguyenvanminh',
    github: 'https://github.com/nguyenvanminh',
  },
  location: {
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    timezone: 'UTC+7',
  },
  preferences: {
    language: 'vi',
    currency: 'VND',
    emailNotifications: true,
    profileVisibility: 'public',
  },
  stats: {
    totalStudents: 1245,
    totalCourses: 8,
    totalRevenue: 150000000, // VND
    averageRating: 4.8,
    totalReviews: 342,
    joinedDate: '2022-01-15',
  },
  bankingInfo: {
    accountHolder: 'Nguyen Van Minh',
    bankName: 'Vietcombank',
    accountNumber: '****1234',
    routingNumber: '****5678',
  },
  taxInfo: {
    taxId: '****567890',
    businessType: 'individual',
  },
};

export default function TeacherProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<TeacherProfile>(mockTeacherProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  const updateProfile = (updates: Partial<TeacherProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    // Simulate API call
    setIsEditing(false);
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
    });
  };

  const handleAvatarUpload = () => {
    toast({
      title: 'Avatar Updated',
      description: 'Your profile picture has been updated.',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const addSpecialization = (specialization: string) => {
    if (specialization.trim() && !profile.specialization.includes(specialization.trim())) {
      updateProfile({
        specialization: [...profile.specialization, specialization.trim()]
      });
    }
  };

  const removeSpecialization = (index: number) => {
    updateProfile({
      specialization: profile.specialization.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Teacher Profile
                </h1>
                <p className="text-slate-600">
                  Manage your profile information and settings
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="bg-white/60 backdrop-blur-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Profile Sidebar */}
          <div className="col-span-4">
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4 inline-block">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl">
                        {profile.firstName[0]}{profile.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        onClick={handleAvatarUpload}
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-gradient-to-r from-blue-500 to-indigo-600"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-slate-600 mb-2">{profile.title}</p>
                  <p className="text-sm text-slate-500 mb-4">{profile.location.city}, {profile.location.country}</p>
                  
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="font-semibold">{profile.stats.averageRating}</span>
                      </div>
                      <p className="text-slate-500">Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">{profile.stats.totalStudents}</span>
                      </div>
                      <p className="text-slate-500">Students</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4 text-emerald-500" />
                        <span className="font-semibold">{profile.stats.totalCourses}</span>
                      </div>
                      <p className="text-slate-500">Courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specializations */}
              <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Specializations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialization.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {spec}
                        {isEditing && (
                          <button
                            onClick={() => removeSpecialization(index)}
                            className="ml-2 hover:bg-blue-200 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Revenue</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(profile.stats.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Reviews</span>
                    <span className="font-semibold">{profile.stats.totalReviews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Experience</span>
                    <span className="font-semibold">{profile.experience} years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Member Since</span>
                    <span className="font-semibold">
                      {new Date(profile.stats.joinedDate).getFullYear()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-8">
            <div className="space-y-6">
              {/* Tab Navigation */}
              <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
                <CardContent className="p-2">
                  <div className="flex space-x-1">
                    {[
                      { id: 'general', label: 'General', icon: <User className="h-4 w-4" /> },
                      { id: 'education', label: 'Education', icon: <GraduationCap className="h-4 w-4" /> },
                      { id: 'social', label: 'Social Links', icon: <LinkIcon className="h-4 w-4" /> },
                      { id: 'preferences', label: 'Preferences', icon: <Shield className="h-4 w-4" /> },
                      { id: 'financial', label: 'Financial', icon: <Briefcase className="h-4 w-4" /> },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                            : 'text-slate-600 hover:bg-white/60'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* General Information */}
              {activeTab === 'general' && (
                <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profile.firstName}
                          onChange={(e) => updateProfile({ firstName: e.target.value })}
                          disabled={!isEditing}
                          className="bg-white/80"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profile.lastName}
                          onChange={(e) => updateProfile({ lastName: e.target.value })}
                          disabled={!isEditing}
                          className="bg-white/80"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => updateProfile({ email: e.target.value })}
                        disabled={!isEditing}
                        className="bg-white/80"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => updateProfile({ phone: e.target.value })}
                          disabled={!isEditing}
                          className="bg-white/80"
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Professional Title</Label>
                        <Input
                          id="title"
                          value={profile.title}
                          onChange={(e) => updateProfile({ title: e.target.value })}
                          disabled={!isEditing}
                          className="bg-white/80"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Biography</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => updateProfile({ bio: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                        className="bg-white/80"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Select 
                          value={profile.location.country}
                          onValueChange={(value) => updateProfile({ 
                            location: { ...profile.location, country: value }
                          })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="bg-white/80">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Vietnam">Vietnam</SelectItem>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="Singapore">Singapore</SelectItem>
                            <SelectItem value="Thailand">Thailand</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={profile.location.city}
                          onChange={(e) => updateProfile({ 
                            location: { ...profile.location, city: e.target.value }
                          })}
                          disabled={!isEditing}
                          className="bg-white/80"
                        />
                      </div>
                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select 
                          value={profile.location.timezone}
                          onValueChange={(value) => updateProfile({ 
                            location: { ...profile.location, timezone: value }
                          })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="bg-white/80">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC+7">UTC+7 (Vietnam)</SelectItem>
                            <SelectItem value="UTC+8">UTC+8 (Singapore)</SelectItem>
                            <SelectItem value="UTC-5">UTC-5 (EST)</SelectItem>
                            <SelectItem value="UTC-8">UTC-8 (PST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Education & Certifications */}
              {activeTab === 'education' && (
                <div className="space-y-6">
                  <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                    <CardHeader>
                      <CardTitle>Education</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {profile.education.map((edu, index) => (
                          <div key={index} className="flex items-start justify-between p-4 rounded-xl bg-white/40">
                            <div>
                              <h4 className="font-semibold text-slate-800">{edu.degree}</h4>
                              <p className="text-slate-600">{edu.institution}</p>
                              <p className="text-sm text-slate-500">Graduated: {edu.year}</p>
                            </div>
                            <GraduationCap className="h-6 w-6 text-blue-500" />
                          </div>
                        ))}
                        {isEditing && (
                          <Button variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Education
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                    <CardHeader>
                      <CardTitle>Certifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {profile.certifications.map((cert, index) => (
                          <div key={index} className="flex items-start justify-between p-4 rounded-xl bg-white/40">
                            <div>
                              <h4 className="font-semibold text-slate-800">{cert.name}</h4>
                              <p className="text-slate-600">{cert.issuer}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary">Issued: {cert.year}</Badge>
                                {cert.expiryDate && (
                                  <Badge variant="outline">Expires: {cert.expiryDate}</Badge>
                                )}
                              </div>
                            </div>
                            <Award className="h-6 w-6 text-amber-500" />
                          </div>
                        ))}
                        {isEditing && (
                          <Button variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Certification
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Social Links */}
              {activeTab === 'social' && (
                <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="website">Personal Website</Label>
                      <Input
                        id="website"
                        value={profile.socialLinks.website || ''}
                        onChange={(e) => updateProfile({ 
                          socialLinks: { ...profile.socialLinks, website: e.target.value }
                        })}
                        disabled={!isEditing}
                        placeholder="https://yourwebsite.com"
                        className="bg-white/80"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedin">LinkedIn Profile</Label>
                      <Input
                        id="linkedin"
                        value={profile.socialLinks.linkedin || ''}
                        onChange={(e) => updateProfile({ 
                          socialLinks: { ...profile.socialLinks, linkedin: e.target.value }
                        })}
                        disabled={!isEditing}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="bg-white/80"
                      />
                    </div>

                    <div>
                      <Label htmlFor="github">GitHub Profile</Label>
                      <Input
                        id="github"
                        value={profile.socialLinks.github || ''}
                        onChange={(e) => updateProfile({ 
                          socialLinks: { ...profile.socialLinks, github: e.target.value }
                        })}
                        disabled={!isEditing}
                        placeholder="https://github.com/yourusername"
                        className="bg-white/80"
                      />
                    </div>

                    <div>
                      <Label htmlFor="twitter">Twitter Profile</Label>
                      <Input
                        id="twitter"
                        value={profile.socialLinks.twitter || ''}
                        onChange={(e) => updateProfile({ 
                          socialLinks: { ...profile.socialLinks, twitter: e.target.value }
                        })}
                        disabled={!isEditing}
                        placeholder="https://twitter.com/yourusername"
                        className="bg-white/80"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preferences */}
              {activeTab === 'preferences' && (
                <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle>Account Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="language">Interface Language</Label>
                        <Select 
                          value={profile.preferences.language}
                          onValueChange={(value) => updateProfile({ 
                            preferences: { ...profile.preferences, language: value }
                          })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="bg-white/80">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vi">Tiếng Việt</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select 
                          value={profile.preferences.currency}
                          onValueChange={(value) => updateProfile({ 
                            preferences: { ...profile.preferences, currency: value }
                          })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="bg-white/80">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VND">Vietnamese Dong (VND)</SelectItem>
                            <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-800">Privacy Settings</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="visibility">Profile Visibility</Label>
                          <p className="text-sm text-slate-500">Who can see your profile information</p>
                        </div>
                        <Select 
                          value={profile.preferences.profileVisibility}
                          onValueChange={(value: any) => updateProfile({ 
                            preferences: { ...profile.preferences, profileVisibility: value }
                          })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="w-40 bg-white/80">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="students_only">Students Only</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notifications">Email Notifications</Label>
                          <p className="text-sm text-slate-500">Receive email updates about your courses and students</p>
                        </div>
                        <Switch
                          id="notifications"
                          checked={profile.preferences.emailNotifications}
                          onCheckedChange={(checked) => updateProfile({ 
                            preferences: { ...profile.preferences, emailNotifications: checked }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Financial Information */}
              {activeTab === 'financial' && (
                <div className="space-y-6">
                  <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Banking Information</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                        >
                          {showSensitiveInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="accountHolder">Account Holder Name</Label>
                        <Input
                          id="accountHolder"
                          value={profile.bankingInfo.accountHolder}
                          onChange={(e) => updateProfile({ 
                            bankingInfo: { ...profile.bankingInfo, accountHolder: e.target.value }
                          })}
                          disabled={!isEditing}
                          className="bg-white/80"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          value={profile.bankingInfo.bankName}
                          onChange={(e) => updateProfile({ 
                            bankingInfo: { ...profile.bankingInfo, bankName: e.target.value }
                          })}
                          disabled={!isEditing}
                          className="bg-white/80"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="accountNumber">Account Number</Label>
                          <Input
                            id="accountNumber"
                            value={showSensitiveInfo ? '1234567890123' : profile.bankingInfo.accountNumber}
                            onChange={(e) => updateProfile({ 
                              bankingInfo: { ...profile.bankingInfo, accountNumber: e.target.value }
                            })}
                            disabled={!isEditing}
                            type={showSensitiveInfo ? 'text' : 'password'}
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label htmlFor="routingNumber">Routing Number</Label>
                          <Input
                            id="routingNumber"
                            value={showSensitiveInfo ? '987654321' : profile.bankingInfo.routingNumber}
                            onChange={(e) => updateProfile({ 
                              bankingInfo: { ...profile.bankingInfo, routingNumber: e.target.value }
                            })}
                            disabled={!isEditing}
                            type={showSensitiveInfo ? 'text' : 'password'}
                            className="bg-white/80"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
                    <CardHeader>
                      <CardTitle>Tax Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="businessType">Business Type</Label>
                        <Select 
                          value={profile.taxInfo.businessType}
                          onValueChange={(value: any) => updateProfile({ 
                            taxInfo: { ...profile.taxInfo, businessType: value }
                          })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="bg-white/80">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="taxId">Tax ID</Label>
                        <Input
                          id="taxId"
                          value={showSensitiveInfo ? '1234567890' : profile.taxInfo.taxId}
                          onChange={(e) => updateProfile({ 
                            taxInfo: { ...profile.taxInfo, taxId: e.target.value }
                          })}
                          disabled={!isEditing}
                          type={showSensitiveInfo ? 'text' : 'password'}
                          className="bg-white/80"
                        />
                      </div>

                      {profile.taxInfo.businessType === 'business' && (
                        <div>
                          <Label htmlFor="businessName">Business Name</Label>
                          <Input
                            id="businessName"
                            value={profile.taxInfo.businessName || ''}
                            onChange={(e) => updateProfile({ 
                              taxInfo: { ...profile.taxInfo, businessName: e.target.value }
                            })}
                            disabled={!isEditing}
                            className="bg-white/80"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}