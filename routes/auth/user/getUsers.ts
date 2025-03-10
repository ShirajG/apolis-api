import {
  db,
  event,
  extractPaginationParams,
  extractSortParams,
} from '#src/utils';

const allowedSortFields = ['user_id', 'role', 'name', 'email'];
const allowedSortDirections = ['ASC', 'DESC'];

export const getUsers = async () => {
  const { limit, offset } = extractPaginationParams(event);
  const { sortBy, sort } = extractSortParams(event);

  // PostgreSQL injection prevention since we need to directly interpolate the sortBy
  const sanitizedSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : 'user_id';
  const sanitizedSort = allowedSortDirections.includes(sort.toUpperCase())
    ? sort.toUpperCase()
    : 'ASC';

  await db.connect();
  const rows = (
    await db.query({
      text: `SELECT * FROM "users" ORDER BY ${sanitizedSortBy} ${sanitizedSort} LIMIT $1 OFFSET $2`,
      values: [limit, offset],
    })
  ).rows;
  await db.clean();
  return rows;
};
