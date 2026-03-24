/**
 * Helper to prefix paths with the Next.js basePath.
 * This ensures assets load correctly on GitHub Pages (subpaths).
 */
export const basePath = '/rachelarts';

export const withBase = (path: string) => {
    if (!path) return path;
    if (path.startsWith('http') || path.startsWith('//')) return path;
    
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // If it already starts with the basePath, don't add it again
    if (cleanPath.startsWith(basePath + '/') || cleanPath === basePath) {
        return cleanPath;
    }
    
    return `${basePath}${cleanPath}`;
};
