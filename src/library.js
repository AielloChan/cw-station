export const characterCount = lesson => lesson.text.replaceAll(' ', '').length;
export function filterLessons(lessons, { query = '', category = '', length = '' } = {}) {
  const term = query.trim().toLowerCase();
  return lessons.map((lesson, index) => ({ lesson, index })).filter(({ lesson }) => {
    const count = characterCount(lesson);
    return (!category || lesson.level === category) &&
      (!term || [lesson.title, lesson.author, lesson.text].join(' ').toLowerCase().includes(term)) &&
      (!length || (length === 'short' ? count <= 150 : length === 'medium' ? count > 150 && count <= 250 : count > 250));
  });
}
export function randomLessonIndex(indices, current, random = Math.random) {
  const candidates = indices.filter(index => index !== current);
  const pool = candidates.length ? candidates : indices;
  return pool.length ? pool[Math.floor(random() * pool.length)] : null;
}
