import { useState } from "react";

import Start from "./components/Start";
import Quiz from "./components/Quiz";

function App() {
  const [start, setStart] = useState(false);

  const toggleStart = () => {
    setStart((prevStart) => !prevStart);
  };

  return (
    <main>
      {start ? (
        <Quiz playAgain={toggleStart} />
      ) : (
        <Start toggleStart={toggleStart} />
      )}
    </main>
  );
}

export default App;
