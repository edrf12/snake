declare module 'use-sound' {
  type Sound = [() => void, { duration: number }]
  const useSound: (src: string, options?: any) => Sound
  export default useSound
}