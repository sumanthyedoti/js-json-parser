function nullParser(input) {
  if (input.indexOf("null") === 0) {
    return [null, input.slice(4)]
  }
  return null
}

function booleanParser(input) {
  const isTrue = input.indexOf("true") === 0
  const isFalse = input.indexOf("false") === 0
  if (isTrue) {
    return [true, input.slice(4)]
  }
  if (isFalse) {
    return [false, input.slice(5)]
  }
  return null
}

function numberParser(input) {
  const inputRegExp = RegExp(
    /^-?(0(?=\D+)|(0(?=\.))|[1-9][0-9]*)(\.?\d*([Ee][-+]?\d+)?)?/
  )
  const matches = input.match(inputRegExp)
  if (!matches) {
    return null
  }
  return [matches[0] * 1, input.slice(matches[0].length)]
}

function stringParser(input) {
  if (input[0] !== '"') {
    return null
  }
  let i = 1
  const validEscapeChars = ['"', "\\", "/", "b", "f", "n", "r", "t", "u"]
  const invalidChars = [
    9, //tab
    10, //line break
  ]
  while (input[i] !== '"') {
    if (invalidChars.includes(input[i].charCodeAt(0))) return null
    if (input[i] === "\\") {
      if (!validEscapeChars.includes(input[i + 1])) return null
      if (input[i + 1] === "u") i += 4
      i += 2
    } else {
      i++
    }
  }
  return [input.slice(1, i), input.slice(i + 1)]
}
// ! test with backslashes

function commaParser(input) {
  if (input[0] === ",") {
    return [",", input.slice(1)]
  }
  return null
}

function colonParser(input) {
  if (input[0] === ":") {
    return [":", input.slice(1)]
  }
  return null
}

function valueParser(input) {
  const parsers = [
    nullParser,
    booleanParser,
    numberParser,
    stringParser,
    arrayParser,
    objectParser,
  ]
  for (let p of parsers) {
    let parsed = p(input)
    if (parsed) return parsed
  }
  return null
}

let removeSpace = (input) => {
  const match = input.match(/^\s+/)
  if (match) {
    return input.slice(match[0].length)
  }
  return input
}

function arrayParser(input) {
  if (input[0] !== "[") return null
  const arr = []
  input = input.slice(1)
  while (true) {
    input = removeSpace(input)

    const valueParsed = valueParser(input)
    if (!valueParsed) break
    arr.push(valueParsed[0])
    input = valueParsed[1]

    input = removeSpace(input)

    const commaParsed = commaParser(input)
    if (!commaParsed) {
      break
    }
    input = commaParsed[1]
    if (input === "]") return null
  }
  return input[0] === "]" ? [arr, removeSpace(input.slice(1))] : null
}

function objectParser(input) {
  if (input[0] !== "{") return null
  let obj = {}
  input = input.slice(1)
  while (true) {
    input = removeSpace(input)
    let stringParsed = stringParser(input)
    if (!stringParsed) break
    let key = stringParsed[0]
    input = stringParsed[1]

    let colonParsed = colonParser(input)
    if (!colonParsed) break
    input = colonParsed[1]

    input = removeSpace(input)
    let valueParsed = valueParser(input)
    if (!valueParsed) break
    obj[key] = valueParsed[0]
    input = valueParsed[1]

    input = removeSpace(input)

    const commaParsed = commaParser(input)
    if (!commaParsed) {
      break
    }
    input = commaParsed[1]
    if (input === "}") return null
  }
  return input[0] === "}" ? [obj, removeSpace(input.slice(1))] : null
}

module.exports = {
  arrayParser,
  objectParser,
}
