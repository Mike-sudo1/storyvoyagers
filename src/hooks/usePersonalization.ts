import { useMemo } from 'react';

interface Child {
  id: string;
  name: string;
  age: number;
  avatar_url?: string;
}

interface StoryTemplate {
  content: string;
  illustrations: Array<{
    page: number;
    description: string;
    placeholder_avatar?: boolean;
  }>;
}

export const usePersonalization = () => {
  const personalizeStory = useMemo(() => {
    return (template: StoryTemplate, child: Child): StoryTemplate => {
      if (!template || !child) return template;

      // Replace text placeholders
      const personalizedContent = template.content
        .replace(/\[CHILD_NAME\]/g, child.name)
        .replace(/\[CHILD_AGE\]/g, child.age.toString());

      // Replace illustration placeholders
      const personalizedIllustrations = template.illustrations.map(illustration => ({
        ...illustration,
        description: illustration.description
          .replace(/\[CHILD_NAME\]/g, child.name)
          .replace(/\[CHILD_AGE\]/g, child.age.toString()),
        avatar_url: illustration.placeholder_avatar ? child.avatar_url : undefined
      }));

      return {
        content: personalizedContent,
        illustrations: personalizedIllustrations
      };
    };
  }, []);

  const extractPlaceholders = useMemo(() => {
    return (content: string): string[] => {
      const placeholderRegex = /\[([^\]]+)\]/g;
      const matches = content.match(placeholderRegex) || [];
      return [...new Set(matches)]; // Remove duplicates
    };
  }, []);

  return { personalizeStory, extractPlaceholders };
};