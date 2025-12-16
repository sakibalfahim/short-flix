// components/VideoGrid.tsx
import styles from '../styles/Home.module.css'
import VideoCard from './VideoCard'

type Short = {
  id: number
  videoUrl: string
  title: string
  tags: string[]
}

export default function VideoGrid({ shorts }: { shorts: Short[] }) {
  return (
    <section className={styles.grid}>
      {shorts.length === 0 && <div className={styles.empty}>No videos found</div>}
      {shorts.map(s => <VideoCard key={s.id} short={s} />)}
    </section>
  )
}
