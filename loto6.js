const fs = require('fs')
const filename = 'lottery6.csv'
fs.createWriteStream(filename).close()
const outfile = fs.createWriteStream(
  filename,
  {
    flags: 'a'
  }
)

const fetch = require('node-fetch')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const csv = require('csv')

const wtos = require('./warekitoseireki.js')

const urlBacknumber = 'https://www.mizuhobank.co.jp/retail/takarakuji/loto/backnumber'
const urlLotteryCsv = 'https://www.mizuhobank.co.jp/retail/takarakuji/loto/loto6/csv'
const maxBacknumber = 460
const maxLottery = 1521

const getLotteryBacknumber = (n) => {
  const times = n || 1

  if (times > maxBacknumber) {
    setTimeout(getLotteryCsv, 500)
    return
  }

  const now = new Date()
  console.log(now.toLocaleTimeString(), times)

  let lotteryTitle = ''
  let lotteryDate  = ''

  const str = times.toString().padStart(4, '0')
  const url = `${urlBacknumber}/loto6${str}.html`
  fetch(url)
    .then(res => {
      if (!res.ok) {
        console.log(res.status, res.url)
        throw Error
      }
      return res.text()
    })
    .then(body => {
      const $ = cheerio.load(body, { decodeEntities: false })
      $('#mainCol .sp-none .typeTK tbody tr').each(function() {
        const lotteryTitle = $(this).children('th').text().match(/\d+/).toString().padStart(4, '0')
        const td = $(this).children('td')
        const lotteryDate = td.first().text()
        for (var i = 1; i < 7; i++) {
          const num = td.eq(i).text()
          outfile.write(
            `"${lotteryTitle}","${lotteryDate}","${num}","0"\n`
          )
        }
        const bonus = td.last().text()
        outfile.write(
          `"${lotteryTitle}","${lotteryDate}","${bonus}","1"\n`
        )
      })
    })

  setTimeout(getLotteryBacknumber, 500, times + 20)
}
getLotteryBacknumber()

const getLotteryCsv = (n) => {
  const start = n || maxBacknumber + 1
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
    const url = `${urlLotteryCsv}/A102${str}.CSV`
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
                const isNo    = index >= 1 && index <= 6 ? 1 : 0
                const isBonus = index >= 8 && index <= 8 ? 1 : 0

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
