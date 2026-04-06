export async function seetFilter(data) {
{
    "alias": [
        "demo.nama AS nama",
        "demo.title AS title",
        "demo.categori AS categori",
        "demo.slug AS slug",
        "demo.desa AS desa",
        "demo.images AS images",
        "demo.id AS id"
    ],
    "aliasNames": [
        "nama",
        "title",
        "categori",
        "slug",
        "desa",
        "images",
        "id"
    ],
    "tabelName": [
        "demo"
    ],
    "where": "WHERE demo.row = '1'",
    "group": false,
    "order": "ORDER BY demo.id DESC",
    "operasi": {
        "demo": {
            "type": "single",
            "index": "",
            "aliasIndex": "demo",
            "keyIndex": 279283707314106,
            "target": "",
            "condition": "",
            "aliasTarget": "",
            "keyTarget": ""
        }
    },
    "limit": 5,
    "offset": 0,
    "access": "private"
}
}