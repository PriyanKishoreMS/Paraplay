import React, { Fragment } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Player from "./components/Player";

const App = () => {
	return (
		<BrowserRouter>
			<Fragment>
				<Routes>
					<Route path={"/"} element={<Player />} />
					{/* <Route path={"/player"} element={<Player />} /> */}
				</Routes>
			</Fragment>
		</BrowserRouter>
	);
};

export default App;
