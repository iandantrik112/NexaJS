import AssetApplication from "./package";
export const PageApplication = [
  {
    name: "AssetApplication",
    component: AssetApplication,
    options: ({ route }) => ({
      title: route.params?.label || "Package",
      headerShown: true,
      headerStyle: {
        backgroundColor: "#009688", // Warna Teal
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontSize: 18,
      },
      headerTitleAlign: "center",
      headerShadowVisible: false,
    }),
  },
];
