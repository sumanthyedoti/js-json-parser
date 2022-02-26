const fs = require("fs")
const path = require("path")
const readline = require("readline")

const jsonParser = require("./parsers")
const { symbols, colors, colorLog } = require("./cli")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: completer,
})
rl.on("close", function () {
  process.exit(0)
})

function completer(line = "./") {
  const input = line.slice(line.lastIndexOf("./"))
  const dir = input.slice(0, input.lastIndexOf("/") + 1)
  const dirContent = fs.readdirSync(dir)
  const partialFileName = input.slice(dir.length)
  const hits = dirContent
    .filter((it) => it.startsWith(partialFileName))
    .map((it) => dir + it)
  return [hits.length ? hits : dirContent, line]
}

colorLog(
  [colors.fgMagenta, "\n["],
  [colors.fgYellow, "{}"],
  [colors.fgMagenta, "]"],
  [colors.fgCyan, " JSON Parser"]
)
colorLog([colors.fgCyan, "================="])

readFileName()

function readFileName() {
  rl.question("\nProvide JSON file to parse:\n", function (input) {
    if (input === ":q" || input === ":quit") {
      rl.close()
    }
    parseJSON(input)
    // create explicit loop
  })
}

function parseJSON(filename) {
  try {
    const data = fs.readFileSync(path.join(__dirname, filename), "utf8")
    const res = jsonParser(data)
    if (res && (res[1] === "" || res[1] === "\n")) {
      colorLog([colors.fgGreen, "\n" + symbols.success], " Output")
      console.log("---------")
      console.log(JSON.stringify(res[0]))
    } else {
      colorLog([colors.fgRed, "\n" + symbols.error], " Invalid JSON!")
    }
  } catch (err) {
    colorLog([colors.fgRed, symbols.warning], " " + err.message)
  }
  readFileName()
}
