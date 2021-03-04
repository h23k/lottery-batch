const fs = require('fs')
const filename = 'lottery7.csv'
fs.createWriteStream(filename).close()
const outfile = fs.createWriteStream(
  filename,
  {
    flags: 'a'
  }
)

const fetch = require('node-fetch')
const iconv = require('iconv-lite')
const csv = require('csv')

const wtos = require('./warekitoseireki.js')

const urlLotteryCsv = 'https://www.mizuhobank.co.jp/retail/takarakuji/loto/loto7/csv'
const maxLottery = 409

const getLotteryCsv = (n) => {
  const start = n || 1
  const end = (start + 20) <= maxLottery ? start + 20 : maxLottery + 1

  if (start > maxLottery) {
    return
  }

  const now = new Date()
  console.log(now.toLocaleTimeString(), start, end)

  for (var times = start; times < end; times++) {
    let rowIndex = 1
    let lotteryTitle = ''
    let lotteryDate  = ''

    const str = times.toString().padStart(4, '0')
    const url = `${urlLotteryCsv}/A103${str}.CSV`
    fetch(url)
      .then(res => {
        if (!res.ok) {
          console.log(res.status, res.url)
          return
        }
        res.body
          .pipe(iconv.decodeStream('shift_jis'))
          .pipe(csv.parse({
            relax_column_count: true
          }))
          .pipe(csv.transform(records => {
            switch (rowIndex++) {
            case 2:
              lotteryTitle = records[0].match(/\d+/)
              lotteryDate  = wtos(records[2])
              break
            case 4:
              records.forEach((record, index) => {
                const isNo    = index >= 1 && index <= 7  ? 1 : 0
                const isBonus = index >= 9 && index <= 10 ? 1 : 0

                if (isNo || isBonus) {
                  outfile.write(
                    `"${lotteryTitle}","${lotteryDate}","${record}","${isBonus}"\n`
                  )
                }
              })
              break
            }
          }))
      })
  }

  setTimeout(getLotteryCsv, 500, end)
}

getLotteryCsv(maxLottery)
