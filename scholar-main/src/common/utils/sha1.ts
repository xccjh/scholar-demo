const hexcase = 0 /* hex output format. 0 - lowercase; 1 - uppercase     */
const chrsz = 8 /* bits per input character. 8 - ASCII; 16 - Unicode    */
/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
export function hexSha1 (s) {
  return binb2hex(coreSha1(str2binb(s), s.length * chrsz))
}

/*
 * Convert an array of big-endian words to a hex string.
 */
function binb2hex (binarray) {
  const hexTab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef'
  let str = ''
  for (let i = 0; i < binarray.length * 4; i++) {
    str += hexTab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) + hexTab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF)
  }
  return str
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb (str) {
  const bin :any = []
  const mask = (1 << chrsz) - 1
  for (let i = 0; i < str.length * chrsz; i += chrsz) {
    bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32)
  }
  return bin
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol (num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt))
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safeAdd (x, y) {
  const lsw = (x & 0xFFFF) + (y & 0xFFFF)
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
  return (msw << 16) | (lsw & 0xFFFF)
}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1Ft (t, b, c, d) {
  if (t < 20) {
    return (b & c) | ((~b) & d)
  }
  if (t < 40) {
    return b ^ c ^ d
  }
  if (t < 60) {
    return (b & c) | (b & d) | (c & d)
  }
  return b ^ c ^ d
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1Kt (t) {
  return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function coreSha1 (x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32)
  x[((len + 64 >> 9) << 4) + 15] = len
  const w = Array(80)
  let a = 1732584193
  let b = -271733879
  let c = -1732584194
  let d = 271733878
  let e = -1009589776
  for (let i = 0; i < x.length; i += 16) {
    const olda = a
    const oldb = b
    const oldc = c
    const oldd = d
    const olde = e
    for (let j = 0; j < 80; j++) {
      if (j < 16) {
        w[j] = x[i + j]
      } else {
        w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1)
      }
      const t = safeAdd(safeAdd(rol(a, 5), sha1Ft(j, b, c, d)), safeAdd(safeAdd(e, w[j]), sha1Kt(j)))
      e = d
      d = c
      c = rol(b, 30)
      b = a
      a = t
    }
    a = safeAdd(a, olda)
    b = safeAdd(b, oldb)
    c = safeAdd(c, oldc)
    d = safeAdd(d, oldd)
    e = safeAdd(e, olde)
  }
  return [a, b, c, d, e]
}
