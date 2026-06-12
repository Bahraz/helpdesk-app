
const db = require('../database.js');


module.exports = class Model {
    static options = {
        tableName: null,
        allowedOrderBy: ['id']
    }

    constructor(data = {}) {
        const schema = this.constructor.schema || {};

        for (const key in schema) {
            const config = schema[key];

            if (config.required && data[key] == null) {
                throw new Error(`Missing required field: ${key}`);
            }

            // pomiń optional bez wartości i bez defaulta
            if (
                data[key] === undefined &&
                !config.required &&
                config.default === undefined
            ) {
                continue;
            }

            this[key] =
                data[key] !== undefined
                    ? data[key]
                    : config.default;
        }
    }

    static getWhereClause(where) {
        if (!where) {
            return { clause: '', params: [] };
        }

        const whereClauses = [];
        const params = [];

        for (const key in where) {
            if (where[key] === null) {
                whereClauses.push(`${key} IS NULL`);
            } else {
                whereClauses.push(`${key} = ?`);
                params.push(where[key]);
            }
        }

        return {
            clause: whereClauses.join(' AND '),
            params
        };
    }

    static buildOrderBy(orderBy) {
        if (!orderBy) return '';

        const [column, direction = 'ASC'] = orderBy.split(' ');

        const safeDirection = direction.toUpperCase();

        if (
            this.options.allowedOrderBy.includes(column) &&
            ['ASC', 'DESC'].includes(safeDirection)
        ) {
            return ` ORDER BY ${column} ${safeDirection}`;
        }

        return '';
    }

    static buildLimit(limit) {
        if (!limit) return '';

        const safeLimit = parseInt(limit, 10);

        if (Number.isInteger(safeLimit) && safeLimit > 0) {
            return ` LIMIT ${safeLimit}`;
        }

        return '';
    }

    static async query(sql, params = []) {
        const [rows] = await db.query(sql, params);
        return rows;
    }

    static async find({
        where = null,
        orderBy = null,
        limit = null
    } = {}, viewName = null) {
        try {
            console.log(`Finding records in table: ${this.options.tableName}`);

            let query = `SELECT * FROM ${viewName || this.options.tableName}`;
            const params = [];

            if (where) {
                console.log('Applying filters:', where);
                var { clause, params: whereParams } =
                this.getWhereClause(where);
            }
            

            if (clause) {
                query += ` WHERE ${clause}`;
                params.push(...whereParams);
            }

            // ORDER BY
            query += this.buildOrderBy(orderBy);

            // LIMIT
            query += this.buildLimit(limit);

            console.log('SQL:', query);
            console.log('Params:', params);

            const [rows] = await db.query(query, params);
            return rows;

        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    static async findOne(options = {}, viewName = null) {
        const results = await this.find(options, viewName);
        return results.length > 0 ? results[0] : null;
    }

    static async delete(options = {}) {
        try {
            const query = `DELETE FROM ${this.options.tableName} WHERE id IN (?)`;
            const result = await db.query(query, [ids]);
            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async create() {
        try {
            const columns = Object.keys(this).filter(key => key !== 'options');
            const values = columns.map(key => this[key]);
            const placeholders = columns.map(() => '?').join(', ');

            const query = `INSERT INTO ${this.constructor.options.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
            const [result] = await db.query(query, values);
            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    // zrobic statyczna
    async update() {
        try {
            const columns = Object.keys(this).filter(key => key !== 'tableName' && key !== 'allowedOrderBy' && key !== 'id');
            const values = columns.map(key => this[key]);
            const setClause = columns.map(key => `${key} = ?`).join(', ');
            const query = `UPDATE ${this.constructor.options.tableName} SET ${setClause} WHERE id = ?`;
            values.push(this.id);
            const [result] = await db.query(query, values);
            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    static async updateById(id, data) {
        data = this.mapFields(data);

        const columns = Object.keys(data);

        if (columns.length === 0) return;

        const values = columns.map(c => data[c]);

        const setClause = columns
            .map(c => `${c} = ?`)
            .join(', ');

        const query = `
        UPDATE ${this.options.tableName}
        SET ${setClause}
        WHERE id = ?
    `;

        values.push(id);

        const [result] = await db.query(query, values);

        return result;
    }

    static toCamel(str) {
        return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    }

    static toSnake(str) {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }

    static mapFields(data = {}) {
        const schemaKeys = Object.keys(this.schema || {});

        const result = {};

        for (const [key, value] of Object.entries(data)) {
            if (value === undefined || value === null) continue;

            if (schemaKeys.includes(key)) {
                result[key] = value;
                continue;
            }

            const snakeKey = this.toSnake(key);

            if (schemaKeys.includes(snakeKey)) {
                result[snakeKey] = value;
            }
        }

        return result;
    }
}