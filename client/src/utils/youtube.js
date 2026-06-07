export const youtubeThumb = (url = '') => {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return match?.[1] ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : '';
};
