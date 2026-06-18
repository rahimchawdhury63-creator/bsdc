import { SITE_NAME, SITE_URL } from '@config/constants';
import type { BSDCPost, BSDCUser } from '@/types';
/** Builds Organization JSON-LD. */
export const organizationSchema = () => ({ '@context':'https://schema.org', '@type':'Organization', name:SITE_NAME, url:SITE_URL, logo:`${SITE_URL}/favicon.svg` });
/** Builds Person JSON-LD for profiles. */
export const personSchema = (user: BSDCUser) => ({ '@context':'https://schema.org', '@type':'Person', name:user.displayName, url:`${SITE_URL}/p/${user.username}`, jobTitle:user.title || undefined, image:user.photoURL || undefined });
/** Builds Article JSON-LD for posts. */
export const articleSchema = (post: BSDCPost) => ({ '@context':'https://schema.org', '@type':'Article', headline:post.title, description:post.seoDescription, url:`${SITE_URL}/post/${post.id}`, image:post.imageUrls, datePublished:post.createdAt });
/** Builds Course JSON-LD. */
export const courseSchema = (title:string, description:string, path:string) => ({ '@context':'https://schema.org', '@type':'Course', name:title, description, provider:{ '@type':'Organization', name:SITE_NAME, sameAs:SITE_URL }, url:`${SITE_URL}${path}` });
/** Builds BreadcrumbList JSON-LD. */
export const breadcrumbSchema = (items: readonly { name:string; url:string }[]) => ({ '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:items.map((item,index)=>({ '@type':'ListItem', position:index+1, name:item.name, item:item.url })) });
