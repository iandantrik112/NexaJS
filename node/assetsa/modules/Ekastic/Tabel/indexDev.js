// Data array keys
const keysData = [
  "Exsampel.id",
  "Exsampel.userid",
  "Exsampel.nama",
  "Exsampel.title",
  "Exsampel.deskripsi",
  "Exsampel.images",
  "Exsampel.row",
  "Exsampel.slug",
  "Exsampel.categori",
  "Exsampel.pubdate",
  "Exsampel.thumbnails",
  "Exsampel.keywords",
  "Exsampel.detail",
  "Exsampel.updated_at",
  "Exsampel.status",
  "Exsampel.dilihat",
  "Exsampel.created_at",
  "Member.id2",
  "Member.nama2",
  "Member.status2",
  "Member.jabatan",
  "Member.role",
  "Member.email",
  "Member.password",
  "Member.telepon",
  "Member.alamat",
  "Member.avatar",
  "Member.thumbnail",
  "Member.package",
  "Member.gender",
  "Member.thumbnails2",
  "Member.token",
  "Member.expired",
  "Member.row2",
];

// Fungsi pencarian sederhana
function searchKeys(pattern) {
  return keysData.find((item) => item.includes(pattern));
}

export { searchKeys };

// Default export
export default keysData;
