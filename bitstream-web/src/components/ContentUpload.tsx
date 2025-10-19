/**
 * Content Upload Component
 * Allows creators to upload content and register it on the blockchain
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContentManagement, type ContentCreationData } from '@/hooks/useContentManagement';
import { formatSTX } from '@/lib/contracts';

interface ContentUploadProps {
  onSuccess?: (contentId: bigint) => void;
  onCancel?: () => void;
}

export const ContentUpload: React.FC<ContentUploadProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const { createContent, isLoading, error, clearError } = useContentManagement();
  
  const [formData, setFormData] = useState<ContentCreationData>({
    title: '',
    description: '',
    contentType: 'video',
    thumbnailUrl: '',
    contentUrl: '',
    price: '',
    duration: undefined,
    tags: [],
    fileSize: 0,
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [uploadStep, setUploadStep] = useState<'form' | 'uploading' | 'success'>('form');

  const handleInputChange = (field: keyof ContentCreationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your content',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.contentUrl.trim()) {
      toast({
        title: 'Content URL required',
        description: 'Please provide a URL for your content',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: 'Price required',
        description: 'Please set a valid price for your content',
        variant: 'destructive',
      });
      return;
    }

    setUploadStep('uploading');
    
    try {
      const result = await createContent(formData);
      
      if (result.success && result.contentId) {
        setUploadStep('success');
        
        toast({
          title: 'Content uploaded successfully! 🎉',
          description: `Your content has been registered on the blockchain`,
        });
        
        // Call success callback after a short delay
        setTimeout(() => {
          onSuccess?.(result.contentId!);
        }, 2000);
      } else {
        setUploadStep('form');
        toast({
          title: 'Upload failed',
          description: result.error || 'Failed to upload content',
          variant: 'destructive',
        });
      }
    } catch (err) {
      setUploadStep('form');
      toast({
        title: 'Upload error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  if (uploadStep === 'success') {
    return (
      <Card className="p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Content Uploaded Successfully!</h2>
        <p className="text-muted-foreground mb-4">
          Your content has been registered on the blockchain and is now available for purchase.
        </p>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-700">
            ✅ Content registered on blockchain<br />
            ✅ Metadata uploaded to IPFS<br />
            ✅ Ready for viewers to purchase
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Upload Content</h2>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Upload Error</span>
          </div>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter content title"
              disabled={uploadStep === 'uploading'}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your content"
              rows={3}
              disabled={uploadStep === 'uploading'}
            />
          </div>

          <div>
            <Label htmlFor="contentType">Content Type</Label>
            <Select
              value={formData.contentType}
              onValueChange={(value) => handleInputChange('contentType', value)}
              disabled={uploadStep === 'uploading'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content URLs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Content URLs</h3>
          
          <div>
            <Label htmlFor="contentUrl">Content URL *</Label>
            <Input
              id="contentUrl"
              value={formData.contentUrl}
              onChange={(e) => handleInputChange('contentUrl', e.target.value)}
              placeholder="https://example.com/content or ipfs://..."
              disabled={uploadStep === 'uploading'}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL to your content file (IPFS, CDN, or direct link)
            </p>
          </div>

          <div>
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
              disabled={uploadStep === 'uploading'}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pricing</h3>
          
          <div>
            <Label htmlFor="price">Price (STX) *</Label>
            <Input
              id="price"
              type="number"
              step="0.000001"
              min="0.000001"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0.001"
              disabled={uploadStep === 'uploading'}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Price per minute for streaming content
            </p>
          </div>

          {formData.duration && (
            <div>
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration || ''}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || undefined)}
                placeholder="3600"
                disabled={uploadStep === 'uploading'}
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tags</h3>
          
          <div className="flex gap-2">
            <Input
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              placeholder="Add a tag"
              disabled={uploadStep === 'uploading'}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addTag}
              disabled={!currentTag.trim() || uploadStep === 'uploading'}
            >
              Add
            </Button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    disabled={uploadStep === 'uploading'}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* File Size */}
        <div>
          <Label htmlFor="fileSize">File Size (bytes)</Label>
          <Input
            id="fileSize"
            type="number"
            min="0"
            value={formData.fileSize || ''}
            onChange={(e) => handleInputChange('fileSize', parseInt(e.target.value) || 0)}
            placeholder="1048576"
            disabled={uploadStep === 'uploading'}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Size of your content file in bytes
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={uploadStep === 'uploading' || isLoading}
            className="flex-1"
          >
            {uploadStep === 'uploading' || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading to Blockchain...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Content
              </>
            )}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={uploadStep === 'uploading' || isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {uploadStep === 'uploading' && (
        <div className="mt-6 bg-primary/10 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-medium">Processing Upload</span>
          </div>
          <div className="space-y-1 text-sm text-primary/80">
            <p>📝 Creating content metadata...</p>
            <p>🔗 Uploading to IPFS...</p>
            <p>⛓️ Registering on blockchain...</p>
          </div>
        </div>
      )}
    </Card>
  );
};