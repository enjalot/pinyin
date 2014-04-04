fs = require 'fs'
csv = require 'csv'
xf = require 'crossfilter'

dict = fs.readFileSync 'cedict.txt'
txt = dict.toString().split("\n")

output = []
characters = []
unique = {}
hash = {}
offset = 0
index = i
for line,i in txt
  # skip comments
  if line.match /^\#/
    offset++
    continue
  index = i - offset
  if index < 20
    console.log line

  # lets pull out just the simplified char + pinyin
  # optionally pull out definition

  word = {}
  # match before pinyin
  chars = line.match /^.*\[/
  word.char = chars[0].split(" ")[1]

  # match  pinyin
  pinyin = line.match /\[.*?\]/
  word.pinyin = pinyin[0].slice(1, pinyin[0].length-1)

  # match definition
  def = line.match /\/.*\//
  word.def = def[0].slice(1, def[0].length-1)

  output.push word

  pins = word.pinyin.split ' '
  for c,ci in word.char
    pin = pins[ci].toLowerCase()
    characters.push c
    if unique[c] and unique[c].indexOf(pin) < 0
      unique[c].push pin
    else
      unique[c] = [pin]
    if hash[c]
      hash[c].push word
    else
      hash[c] = [word]

  #if index < 20
  #  console.log word

set = xf(output)
len = set.dimension (d) -> d.pinyin.split(" ").length
console.log len.group().all()

test = len.filter(3).top(10)
test.forEach (d) ->
  console.log d

simple = len.filter([1, 3]).top(Infinity)
console.log "simple", simple.length
#lots.forEach (d) ->
#  console.log d

#csv().from.array(simple)
  #.to(__dirname+'/cedict-simple.csv', { columns: ["char", "pinyin", "def"] })
#.to(__dirname+'/cedict-simple.csv', { columns: ["char", "pinyin"] })

cset = xf(characters)
cs = cset.dimension (c) -> c
group = cs.group()
#uniques = Object.keys(unique)
console.log "# uniques #{group.size()}"
#console.log "top 10", group.top(10)

singles = []
group.top(Infinity).forEach (c) ->
  #console.log c.key, c.value, unique[c.key]
  singles.push {
    char: c.key
    count: c.value
    pinyin: unique[c.key]
  }

# write out the single characters with pinyin
csv().from.array(singles)
.to(__dirname+'/cedict-singles.csv', { columns: ["char", "pinyin", "count"], header: true })


writeWord = (char, words) ->
  content = ""
  csv().from.array(words)
  .to((data) ->
    #console.log data + "\n --- \n"
    #content += data + "\n"
    console.log char, ind++
    fs.writeFileSync("#{__dirname}/charhash/#{char}.csv", data)
  , { columns: ["char", "pinyin", "def"], header:true })

  # write to each char file
  #.to(__dirname+"/charhash/#{char}.csv", { columns: ["char", "pinyin", "def"] })

# write out the hashed character definitions to 10k files!
ind = 0
for ch,rows of hash
  writeWord(ch, rows)

