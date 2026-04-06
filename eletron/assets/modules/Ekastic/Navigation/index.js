
export async function refNavigation(data) {
  try {
    const module = await import(`./${data.key}.js`);
      const storage = await window.NXUI.ref.get("bucketsStore", "Navigation");
     if (!storage) {

        const dataInstall = await new NXUI.NexaModels()
         .Storage("nexa_office")
         .select(["*"])
         .where("data_type", 'Route')
         .orderBy('id', "DESC")
         .first();
         await NXUI.ref.set("bucketsStore", JSON.parse(dataInstall.data.data_value));
     }
    // Coba cari fungsi dengan nama key langsung
    let contentFunction = module[data.key];
    
    // Jika tidak ada dan key dimulai dengan "ref", coba format "new{Key}"
    if (!contentFunction && data.key.startsWith('ref')) {
      const keyWithoutRef = data.key.substring(3); // Hapus "ref"
      const newFunctionName = `new${keyWithoutRef.charAt(0).toUpperCase() + keyWithoutRef.slice(1)}`;
      contentFunction = module[newFunctionName];
    }
    
    // Jika masih tidak ada, coba default export
    if (!contentFunction && module.default) {
      contentFunction = module.default;
    }
    
    if (typeof contentFunction !== 'function') {
      throw new Error(`Function not found for key "${data.key}". Available: ${Object.keys(module).filter(k => typeof module[k] === 'function').join(', ')}`);
    }
    
    return await contentFunction(data);
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
    throw error;
  }
}