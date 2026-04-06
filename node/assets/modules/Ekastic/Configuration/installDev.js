export async function setInstall(data) {
  const dataform = await NXUI.ref.getAll("nexaStore");
  console.log(dataform);
  // Extract className and type from each item
  const dataformLabel = dataform.data.map((item) => ({
    name:
      item.className.length > 10
        ? item.className.substring(0, 10) + "..."
        : item.className,
    appName: item.className,
    icon: "archive",
    id: item.id,
    key: item.key,
    color: "#777BB4",
    type: item.type,
    category: item.type,

    extension: "app",
  }));
  console.log(dataformLabel);

  return dataformLabel;
}
    