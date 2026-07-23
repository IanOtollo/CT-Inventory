const cp = require("child_process");
try {
  cp.execSync('npx convex run equipment:deleteAsset "{\\"assetTag\\":\\"CT-ICT-001\\",\\"serialNumber\\":\\"12345678\\"}"', {stdio: "inherit"});
} catch (e) {
  console.error(e);
}
