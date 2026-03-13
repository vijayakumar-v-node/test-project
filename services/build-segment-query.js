module.exports = function buildSegmentQuery(filters) {
    let query = `SELECT DISTINCT c.* FROM contacts c `;

    let joins = [];
    let conditions = [];
    let params = [];

    if (filters.tags && filters.tags.length > 0) {
        joins.push("LEFT JOIN contact_tags t ON c.id = t.contactId");
        conditions.push(`t.tagName IN (${filters.tags.map(() => "?").join(",")})`);
        params.push(...filters.tags);
    }

    if (filters.region) {
        conditions.push("c.region = ?");
        params.push(filters.region);
    }

    if (filters.lastPurchasedWithinDays) {
        conditions.push(
            "c.lastPurchaseDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY)"
        );
        params.push(filters.lastPurchasedWithinDays);
    }

    if (joins.length > 0) {
        query += joins.join(" ");
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    return { query, params };
}