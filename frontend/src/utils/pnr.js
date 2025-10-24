export function generatePNR(){
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let p = ''
  for(let i=0;i<10;i++) p += chars[Math.floor(Math.random()*chars.length)]
  return p
}
