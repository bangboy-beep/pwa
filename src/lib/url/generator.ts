export function getPublicMenuUrl(slug: string): string {
  return `${window.location.origin}/m/${slug}`
}

export function getPublicWifiUrl(slug: string): string {
  return `${window.location.origin}/w/${slug}`
}

export function getPublicReviewUrl(slug: string): string {
  return `${window.location.origin}/r/${slug}`
}

export function getPublicCustomerHubUrl(slug: string): string {
  return `${window.location.origin}/q/${slug}`
}
