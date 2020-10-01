module.exports = (wareki) => {
  const matches = wareki.match('^(明治|大正|昭和|平成|令和)([元０-９0-9]+)年(.*)')

  if (matches) {
    const eraName = matches[1]
    let year = parseInt(matches[2].replace(/[元０-９]/g, match => {
      if (match === '元') {
        return 1
      }
      return String.fromCharCode(match.charCodeAt(0) - 65248);
    }))

    if (eraName === '明治') {
      year += 1867
    } else if (eraName === '大正') {
      year += 1911
    } else if (eraName === '昭和') {
      year += 1925
    } else if (eraName === '平成') {
      year += 1988
    } else if (eraName === '令和') {
      year += 2018
    }
    return year + '年' + matches[3]
  }

  return wareki
}
