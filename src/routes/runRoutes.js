const express = require("express");
const router = express.Router();
const vm = require("vm");

router.post("/", async (req, res) => {
  const { code } = req.body;

  try {
    let output = "";

    const sandbox = {
      console: {
        log: (...args) => {
          output += args.join(" ") + "\n";
        }
      }
    };

    vm.createContext(sandbox);

    const script = new vm.Script(code);
    script.runInContext(sandbox, { timeout: 2000 });

    res.json({ success: true, output: output || "Code executed successfully" });

  } catch (err) {
    res.json({ success: false, output: err.message });
  }
});

module.exports = router;