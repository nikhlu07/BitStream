/**
 * React hook for content management operations
 * Handles content creation, updates, and metadata management
 */

import { useState, useCallback, useEffect } from 'react';
import { useContractInteraction } from './useContractInteraction';
import { useStacksWallet } from './useStacksWallet';
import {
  type ContentInfo,
  type ContentMetadata,
  generateContentHash,
  formatSTX,
  parseSTX,
} from '../lib/contracts';

export interface ContentCreationData {
  title: string;
  description: string;
  contentType: 'video' | 'image' | 'audio' | 'document';
  thumbnailUrl: string;
  contentUrl: string;
  price: string; // STX amount as string
  duration?: number;
  tags: string[];
  fileSize: number;
}

export interface UseContentManagementReturn {
  // State
  isLoading: boolean;
  error: string | null;
  creatorContent: ContentInfo[];
  
  // Functions
  createContent: (data: ContentCreationData) => Promise<{ success: boolean; contentId?: bigint; error?: string }>;
  updateContent: (contentId: bigint, data: Partial<ContentCreationData>) => Promise<{ success: boolean; error?: string }>;
  loadCreatorContent: () => Promise<void>;
  getContentById: (contentId: bigint) => Promise<ContentInfo | null>;
  
  // Utility Functions
  clearError: () => void;
}

/**
 * Hook for managing content creation and updates
 */
export const useContentManagement = (): UseContentManagementReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatorContent, setCreatorContent] = useState<ContentInfo[]>([]);
  
  const { address } = useStacksWallet();
  const {
    registerContent,
    updateContentMetadata,
    getContentInfo,
    getCreatorContent,
    error: contractError,
    clearError: clearContractError,
  } = useContractInteraction();

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
    clearContractError();
  }, [clearContractError]);

  // Upload metadata to IPFS (mock implementation)
  const uploadMetadataToIPFS = useCallback(async (metadata: ContentMetadata): Promise<string> => {
    // In a real implementation, this would upload to IPFS
    // For now, we'll create a mock IPFS URI
    const metadataString = JSON.stringify(metadata);
    const hash = await generateContentHash(metadataString);
    return `ipfs://${hash}`;
  }, []);

  // Create new content
  const createContent = useCallback(async (
    data: ContentCreationData
  ): Promise<{ success: boolean; contentId?: bigint; error?: string }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate price
      const priceInMicroSTX = parseSTX(data.price);
      if (priceInMicroSTX <= 0n) {
        throw new Error('Price must be greater than 0');
      }

      // Generate content hash from content URL
      const contentHash = await generateContentHash(data.contentUrl);

      // Create metadata object
      const metadata: ContentMetadata = {
        title: data.title,
        description: data.description,
        contentType: data.contentType,
        thumbnailUrl: data.thumbnailUrl,
        contentUrl: data.contentUrl,
        duration: data.duration,
        tags: data.tags,
        createdAt: new Date().toISOString(),
        fileSize: data.fileSize,
        checksum: contentHash,
      };

      // Upload metadata to IPFS
      const metadataUri = await uploadMetadataToIPFS(metadata);

      // Register content on blockchain
      const result = await registerContent({
        contentHash,
        metadataUri,
        price: priceInMicroSTX,
      });

      if (result.success && result.data) {
        // Refresh creator content list
        await loadCreatorContent();
        
        return {
          success: true,
          contentId: result.data.contentId,
        };
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to register content',
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [address, registerContent, uploadMetadataToIPFS, loadCreatorContent]);

  // Update existing content
  const updateContent = useCallback(async (
    contentId: bigint,
    data: Partial<ContentCreationData>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current content info
      const currentContentResult = await getContentInfo(contentId);
      if (!currentContentResult.success || !currentContentResult.data) {
        throw new Error('Content not found');
      }

      const currentContent = currentContentResult.data;

      // Create updated metadata (merge with existing)
      const updatedMetadata: ContentMetadata = {
        title: data.title || 'Existing Title', // Would fetch from current metadata
        description: data.description || 'Existing Description',
        contentType: data.contentType || 'video',
        thumbnailUrl: data.thumbnailUrl || 'existing-thumbnail-url',
        contentUrl: data.contentUrl || 'existing-content-url',
        duration: data.duration,
        tags: data.tags || [],
        createdAt: new Date(Number(currentContent.createdAt) * 1000).toISOString(),
        fileSize: data.fileSize || 0,
        checksum: currentContent.contentHash,
      };

      // Upload updated metadata to IPFS
      const metadataUri = await uploadMetadataToIPFS(updatedMetadata);

      // Update price if provided
      const newPrice = data.price ? parseSTX(data.price) : currentContent.price;

      // Update content metadata on blockchain
      const result = await updateContentMetadata({
        contentId,
        newMetadataUri: metadataUri,
        newPrice,
      });

      if (result.success) {
        // Refresh creator content list
        await loadCreatorContent();
        
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to update content',
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [address, getContentInfo, updateContentMetadata, uploadMetadataToIPFS, loadCreatorContent]);

  // Load creator's content
  const loadCreatorContent = useCallback(async () => {
    if (!address) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get content IDs for creator
      const contentIdsResult = await getCreatorContent(address);
      
      if (!contentIdsResult.success || !contentIdsResult.data) {
        setCreatorContent([]);
        return;
      }

      // Fetch detailed info for each content item
      const contentPromises = contentIdsResult.data.map(async (contentId) => {
        const contentResult = await getContentInfo(contentId);
        return contentResult.success ? contentResult.data : null;
      });

      const contentInfos = await Promise.all(contentPromises);
      const validContent = contentInfos.filter((info): info is ContentInfo => info !== null);
      
      setCreatorContent(validContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [address, getCreatorContent, getContentInfo]);

  // Get content by ID
  const getContentById = useCallback(async (contentId: bigint): Promise<ContentInfo | null> => {
    try {
      const result = await getContentInfo(contentId);
      return result.success ? result.data || null : null;
    } catch (err) {
      console.error('Error fetching content:', err);
      return null;
    }
  }, [getContentInfo]);

  // Load creator content when address changes
  useEffect(() => {
    if (address) {
      loadCreatorContent();
    } else {
      setCreatorContent([]);
    }
  }, [address, loadCreatorContent]);

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      setError(contractError.userMessage);
    }
  }, [contractError]);

  return {
    // State
    isLoading,
    error,
    creatorContent,
    
    // Functions
    createContent,
    updateContent,
    loadCreatorContent,
    getContentById,
    
    // Utility Functions
    clearError,
  };
};