export const rad2deg = (radians: number): number => radians * (180 / Math.PI)

export const deg2rad = (degrees: number): number => degrees * (Math.PI / 180)

export const rad2sector = (radians: number): number => {
    // 1 - right
    // 2 - down
    // 3 - left
    // 4 - up
    const two_pi = 2 * Math.PI
    let normalized_radians = ((radians % two_pi) + two_pi) % two_pi
  
    const r45 = Math.PI / 4
    const r135 = 3 * Math.PI / 4
    const r225 = 5 * Math.PI / 4
    const r315 = 7 * Math.PI / 4
  
    if (normalized_radians <= r45 || normalized_radians > r315) return 1
    if (normalized_radians <= r135) return 2
    if (normalized_radians <= r225) return 3
    return 4
  }