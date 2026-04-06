export async function uidAccses(data) {
 const app = {
        id: data.id,
        alias: [
            "user.status AS status",
            "user.nama AS nama", 
            "user.jabatan AS jabatan",
            "user.avatar AS avatar",
            "user.id AS id"
        ],
        aliasNames: ["status", "nama", "jabatan","avatar", "id"],
        tabelName: ["user"],
        where: false,
        group: false,
        order: false,
        operasi: {
            user: {
                type: "single",
                index: "",
                aliasIndex: "user",
                keyIndex: 261760199266386,
                target: "",
                condition: "",
                aliasTarget: "",
                keyTarget: ""
            }
        },
        access: "public",
       
        subquery: {
          alias: [
            "controllers.id AS id",
            "controllers.categori AS categori",
            "controllers.label AS label",
            "controllers.status AS status",
            "controllers.pintasan AS pintasan",
            "controllers.acdelete AS acdelete"
          ],
          aliasNames: ["userid", "categori", "label"],
          tabelName: ["controllers"],
          where:
            "WHERE controllers.userid = Member.id AS userid AND controllers.label = '" +data.className +
            "'",
          group: false,
          order: false,
          operasi: {
            controllers: {
              type: "single",
              index: "",
              aliasIndex: "controllers",
              keyIndex: 35634900205686,
              target: "",
              condition: "",
              aliasTarget: "",
              keyTarget: ""
            }
          }
        },
      };
      // return app

        const dataTabel = await NXUI.Storage().models("Office").executeOperation(app);
  const totalCount = dataTabel.data.totalCount;
  return dataTabel.data.response;
}
