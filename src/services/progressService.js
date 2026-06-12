const pool = require("../config/db");

exports.completeMaterial = async (
  user_id,
  data
) => {

  // bulk insert
  if (Array.isArray(data)) {

    const results = [];

    for (const item of data) {

      const result = await pool.query(`
        INSERT INTO user_progress (
          user_id,
          material_id,
          is_completed,
          completed_at
        )
        VALUES ($1, $2, true, NOW())

        ON CONFLICT (user_id, material_id)
        DO UPDATE SET
          is_completed = true,
          completed_at = NOW()

        RETURNING *
      `, [
        user_id,
        item.material_id
      ]);

      results.push(result.rows[0]);
    }

    return results;
  }

  // single insert
  const result = await pool.query(`
    INSERT INTO user_progress (
      user_id,
      material_id,
      is_completed,
      completed_at
    )
    VALUES ($1, $2, true, NOW())

    ON CONFLICT (user_id, material_id)
    DO UPDATE SET
      is_completed = true,
      completed_at = NOW()

    RETURNING *
  `, [
    user_id,
    data.material_id
  ]);

  return result.rows[0];
};

exports.getMyProgress = async (user_id) => {

  const result = await pool.query(`
    SELECT 
      user_progress.*,
      materials.title
    FROM user_progress
    JOIN materials
      ON user_progress.material_id = materials.id
    WHERE user_progress.user_id = $1
  `, [user_id]);

  return result.rows;
};

exports.getProgressPercentage = async (
  user_id,
  category_id
) => {

  const result = await pool.query(`
    SELECT 
      ROUND(
        (
          COUNT(
            CASE 
              WHEN up.is_completed = true THEN 1
            END
          )::decimal
          /
          NULLIF(COUNT(m.id), 0)
        ) * 100,
        0
      ) AS progress_percentage

    FROM materials m

    LEFT JOIN user_progress up
      ON m.id = up.material_id
      AND up.user_id = $1

    WHERE m.category_id = $2
  `, [user_id, category_id]);

  return result.rows[0];
  console.log(result.rows[0]);
};