import { useParams } from 'react-router-dom';
import type { PostType } from '@/types';
import { BlogPostForm } from './BlogPostForm';
import { CodeSnippetForm } from './CodeSnippetForm';
import { DocsPostForm } from './DocsPostForm';
import { EventPostForm } from './EventPostForm';
import { ImagePostForm } from './ImagePostForm';
import { JobPostForm } from './JobPostForm';
import { NoticePostForm } from './NoticePostForm';
import { PollPostForm } from './PollPostForm';
import { ProjectShareForm } from './ProjectShareForm';
import { QAPostForm } from './QAPostForm';
import { ResourcePostForm } from './ResourcePostForm';
import { TextPostForm } from './TextPostForm';
import { TutorialPostForm } from './TutorialPostForm';
import { WikiPostForm } from './WikiPostForm';

/** Allowed post type route parameters mapped to concrete form components. */
const POST_TYPES = ['text', 'image', 'qa', 'blog', 'wiki', 'docs', 'code', 'project', 'job', 'notice', 'poll', 'event', 'resource', 'tutorial', 'story'] as const;

/** Runtime guard for validating route params before rendering a post form. */
const isPostType = (value: string | undefined): value is PostType => Boolean(value && POST_TYPES.includes(value as PostType));

/** Universal post creation hub that selects the correct form by URL type. */
export const PostCreator = () => {
  const { type } = useParams();
  const postType: PostType = isPostType(type) ? type : 'text';

  switch (postType) {
    case 'image': return <ImagePostForm />;
    case 'qa': return <QAPostForm />;
    case 'blog': return <BlogPostForm />;
    case 'wiki': return <WikiPostForm />;
    case 'docs': return <DocsPostForm />;
    case 'code': return <CodeSnippetForm />;
    case 'project': return <ProjectShareForm />;
    case 'job': return <JobPostForm />;
    case 'notice': return <NoticePostForm />;
    case 'poll': return <PollPostForm />;
    case 'event': return <EventPostForm />;
    case 'resource': return <ResourcePostForm />;
    case 'tutorial': return <TutorialPostForm />;
    case 'story': return <TextPostForm />;
    case 'text':
    default:
      return <TextPostForm />;
  }
};
