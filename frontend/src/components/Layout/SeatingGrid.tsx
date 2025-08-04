import { Grid } from './Grid'
import './SeatingGrid.css'

interface Seat {
  id: string
  studentName: string
  status: 'present' | 'absent' | 'unknown'
  row: number
  col: number
}

interface SeatingGridProps {
  seats: Seat[]
  onSeatClick: (seatId: string) => void
}

function SeatingGrid({ seats, onSeatClick }: SeatingGridProps) {
  const renderSeat = (seat: Seat) => (
    <div
      key={seat.id}
      className={`seat seat-${seat.status}`}
      onClick={() => onSeatClick(seat.id)}
    >
      <span className="student-name">{seat.studentName}</span>
    </div>
  )

  return (
    <div className="seating-container">
      <Grid 
        columns={5} 
        gap="10px"
        className="seating-grid"
      >
        {seats.map(renderSeat)}
      </Grid>
      <div className="door">문</div>
    </div>
  )
}

export default SeatingGrid
