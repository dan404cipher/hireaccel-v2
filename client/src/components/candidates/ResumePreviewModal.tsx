import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Briefcase,
  GraduationCap,
  Award,
  Code,
  MapPin,
  Phone,
  Linkedin,
  Globe,
  FileText,
  CheckCircle,
  X as XIcon,
} from 'lucide-react';
import { CandidateProfile } from '@/types';
import { format } from 'date-fns';

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedProfile: Partial<CandidateProfile>;
  currentProfile: CandidateProfile;
  onApplyChanges: () => void;
}

export function ResumePreviewModal({
  isOpen,
  onClose,
  parsedProfile,
  currentProfile,
  onApplyChanges,
}: ResumePreviewModalProps) {
  // Helper function to format date strings
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  // Helper function to check if a field has changes
  const hasChanges = (field: keyof CandidateProfile) => {
    if (!parsedProfile[field]) return false;
    
    if (Array.isArray(parsedProfile[field])) {
      return JSON.stringify(parsedProfile[field]) !== JSON.stringify(currentProfile[field]);
    }
    
    return parsedProfile[field] !== currentProfile[field];
  };

  // Helper function to render a section header with change indicator
  const SectionHeader = ({ title, field }: { title: string, field: keyof CandidateProfile }) => (
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      {hasChanges(field) && (
        <Badge variant="secondary" className="text-xs">
          Changes detected
        </Badge>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Update Profile from Resume</DialogTitle>
          <DialogDescription>
            Review the information extracted from your resume. Choose whether to update your profile with this information.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(80vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Summary Section */}
            {parsedProfile.summary && (
              <div>
                <SectionHeader title="Professional Summary" field="summary" />
                <p className="text-sm text-muted-foreground">{parsedProfile.summary}</p>
              </div>
            )}

            <Separator />

            {/* Skills Section */}
            {parsedProfile.skills && parsedProfile.skills.length > 0 && (
              <div>
                <SectionHeader title="Skills" field="skills" />
                <div className="flex flex-wrap gap-2">
                  {parsedProfile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Experience Section */}
            {parsedProfile.experience && parsedProfile.experience.length > 0 && (
              <div>
                <SectionHeader title="Work Experience" field="experience" />
                <div className="space-y-4">
                  {parsedProfile.experience.map((exp, index) => (
                    <div key={index} className="flex gap-4">
                      <Briefcase className="h-5 w-5 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">{exp.title}</h4>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                        </p>
                        <p className="text-sm mt-1">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Education Section */}
            {parsedProfile.education && parsedProfile.education.length > 0 && (
              <div>
                <SectionHeader title="Education" field="education" />
                <div className="space-y-4">
                  {parsedProfile.education.map((edu, index) => (
                    <div key={index} className="flex gap-4">
                      <GraduationCap className="h-5 w-5 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">{edu.degree} in {edu.field}</h4>
                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Certifications Section */}
            {parsedProfile.certifications && parsedProfile.certifications.length > 0 && (
              <div>
                <SectionHeader title="Certifications" field="certifications" />
                <div className="space-y-4">
                  {parsedProfile.certifications.map((cert, index) => (
                    <div key={index} className="flex gap-4">
                      <Award className="h-5 w-5 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        <p className="text-sm text-muted-foreground">
                          Issued: {formatDate(cert.issueDate)}
                          {cert.expiryDate && ` - Expires: ${formatDate(cert.expiryDate)}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Projects Section */}
            {parsedProfile.projects && parsedProfile.projects.length > 0 && (
              <div>
                <SectionHeader title="Projects" field="projects" />
                <div className="space-y-4">
                  {parsedProfile.projects.map((project, index) => (
                    <div key={index} className="flex gap-4">
                      <Code className="h-5 w-5 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        {project.role && (
                          <p className="text-sm text-muted-foreground">Role: {project.role}</p>
                        )}
                        <p className="text-sm mt-1">{project.description}</p>
                        {project.technologies && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.technologies.map((tech, techIndex) => (
                              <Badge key={techIndex} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block"
                          >
                            View on GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Contact Information */}
            <div>
              <SectionHeader title="Contact Information" field="location" />
              <div className="space-y-2">
                {parsedProfile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{parsedProfile.location}</span>
                  </div>
                )}
                {parsedProfile.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{parsedProfile.phoneNumber}</span>
                  </div>
                )}
                {parsedProfile.linkedinUrl && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    <a
                      href={parsedProfile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {parsedProfile.portfolioUrl && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a
                      href={parsedProfile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Portfolio Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center mt-6">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              <FileText className="h-4 w-4 inline mr-1" />
              Only fields with detected changes will be updated
            </p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              <XIcon className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={onApplyChanges}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
