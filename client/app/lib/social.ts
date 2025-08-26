// Helpers for social link display labels
const DISPLAY_MAP: Record<string, string> = {
    x: 'X',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    weibo: 'Weibo',
    wechat: 'WeChat',
    rednote: 'Rednote',
    youtube: 'YouTube',
    twitch: 'Twitch',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    douyin: 'Douyin',
    website: 'Website'
};

export const socialKeyLabel = (key?: string | null) => {
    if (!key) return '';
    const lc = String(key).toLowerCase();
    return DISPLAY_MAP[lc] ?? (lc.charAt(0).toUpperCase() + lc.slice(1));
};
