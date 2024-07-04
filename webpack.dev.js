import { merge } from "webpack-merge";
import { fileURLToPath } from "url";
import path from "path";
import common from "./webpack.common.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default merge(common, {
	mode: "development",
	devtool: "inline-source-map",
	devServer: {
		contentBase: path.join(__dirname, "dist")
	}
});
