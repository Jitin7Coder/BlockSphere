import { CONTRACT_ABI, CONTRACT_ADDRESS } from './contract'
import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import './App.css'

const events = [
  {
    id: 1,
    contractEventId: 1,
    title: 'Neon Nights Music Festival',
    category: 'Music',
    date: '29 NOV · 7:00 PM',
    eventDate: '2026-10-29T19:00:00',
    eventEndDate: '2026-10-29T22:00:00',
    city: 'Mumbai',
    price: 1499,
    chainPriceEth: '0.001',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=85',
    tag: 'TRENDING',
  },
  {
    id: 2,
    contractEventId: 2,
    title: 'The Comedy Club',
    category: 'Comedy',
    date: '15 SEP · 8:00 PM',
    eventDate: '2026-09-15T20:00:00',
    eventEndDate: '2026-09-15T22:00:00',
    city: 'Mumbai',
    price: 499,
    chainPriceEth: '0.002',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=900&q=85',
    tag: 'POPULAR',
  },
  {
    id: 3,
    contractEventId: 3,
    title: 'Champions Football Night',
    category: 'Sports',
    date: '10 APR · 6:30 PM',
    eventDate: '2027-04-10T18:30:00',
    eventEndDate: '2027-04-10T21:30:00',
    city: 'Pune',
    price: 799,
    chainPriceEth: '0.003',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=85',
    tag: 'SPORTS',
  },
  {
    id: 4,
    contractEventId: 4,
    title: 'Theatre Under The Stars',
    category: 'Theatre',
    date: '25 JUL · 7:30 PM',
    eventDate: '2027-07-25T19:30:00',
    eventEndDate: '2027-07-25T22:00:00',
    city: 'Mumbai',
    price: 699,
    chainPriceEth: '0.0015',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=85',
    tag: 'THEATRE',
  },
  {
    id: 5,
    contractEventId: 5,
    title: 'Electric Sunset',
    category: 'Music',
    date: '30 OCT · 5:00 PM',
    eventDate: '2027-10-30T17:00:00',
    eventEndDate: '2027-10-30T21:00:00',
    city: 'Nashik',
    price: 999,
    chainPriceEth: '0.0025',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=85',
    tag: 'NEW',
  },
  {
    id: 6,
    contractEventId: 6,
    title: 'Creative Minds Workshop',
    category: 'Workshops',
    date: '12 FEB · 11:00 AM',
    eventDate: '2028-02-12T11:00:00',
    eventEndDate: '2028-02-12T13:00:00',
    city: 'Pune',
    price: 399,
    chainPriceEth: '0.001',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85',
    tag: 'WORKSHOP',
  },
]

const categories = [
  'All Events',
  'Music',
  'Comedy',
  'Sports',
  'Theatre',
  'Workshops',
]

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=90',
    alt: 'Crowd enjoying a live music festival',
  },
  {
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=90',
    alt: 'Concert stage and lights',
  },
  {
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=90',
    alt: 'Music event under colourful lights',
  },
  {
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=90',
    alt: 'Football stadium event',
  },
]

function formatEventDate(event) {
  const start = new Date(event.eventDate)
  if (Number.isNaN(start.getTime())) return event.date

  const datePart = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(start).toUpperCase()

  const timePart = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(start)

  return `${datePart} · ${timePart}`
}

function getEventStatus(event, now = Date.now()) {
  const start = new Date(event.eventDate).getTime()
  const end = new Date(
    event.eventEndDate || event.eventDate
  ).getTime()

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return 'ended'
  }

  if (now >= end) return 'ended'
  if (now >= start) return 'live'
  return 'upcoming'
}

function App() {
  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const [category, setCategory] = useState('All Events')
  const [search, setSearch] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [bookingMessage, setBookingMessage] = useState('')
  const [city, setCity] = useState('All Cities')
  const [walletAddress, setWalletAddress] = useState('')
  const [walletError, setWalletError] = useState('')
  const [contract, setContract] = useState(null)
  const [myTickets, setMyTickets] = useState([])
  const [ticketsError, setTicketsError] = useState('')
  const [showMyTickets, setShowMyTickets] = useState(false)
  const [favoriteEventIds, setFavoriteEventIds] = useState([])
  const [isBooking, setIsBooking] = useState(false)
  const [isLoadingTickets, setIsLoadingTickets] = useState(false)
  const [clockNow, setClockNow] = useState(Date.now())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroSlideIndex(
        (current) => (current + 1) % heroSlides.length
      )
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockNow(Date.now())
    }, 30000)

    return () => window.clearInterval(timer)
  }, [])

  function toggleFavorite(eventId) {
    setFavoriteEventIds((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]
    )
  }

  const connectWallet = useCallback(async () => {
    setWalletError('')

    if (!window.ethereum) {
      setWalletError(
        'MetaMask is not installed or enabled. Open this site in a compatible wallet browser.'
      )
      return
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (!accounts.length) {
        setWalletError('Please select a MetaMask account.')
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()

      if (network.chainId !== 31337n) {
        setContract(null)
        setWalletAddress('')
        setWalletError(
          'Please select the Hardhat Local network (Chain ID 31337) in MetaMask.'
        )
        return
      }

      const code = await provider.getCode(CONTRACT_ADDRESS)

      if (code === '0x') {
        setContract(null)
        setWalletAddress('')
        setWalletError(
          'No contract found at this address. Check that Hardhat is running and the contract address is correct.'
        )
        return
      }

      const signer = await provider.getSigner()
      const bookingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      )

      setWalletAddress(accounts[0])
      setContract(bookingContract)
      setBookingMessage('Wallet and smart contract connected.')
    } catch (error) {
      setWalletError(
        error?.shortMessage ||
          error?.message ||
          'Wallet connection failed.'
      )
    }
  }, [])

  useEffect(() => {
    if (!window.ethereum) return undefined

    const handleAccountsChanged = (accounts) => {
      setWalletAddress('')
      setContract(null)
      setMyTickets([])

      if (accounts.length) {
        setBookingMessage(
          'Account changed. Please connect your wallet again.'
        )
      }
    }

    const handleChainChanged = () => {
      setWalletAddress('')
      setContract(null)
      setMyTickets([])
      setWalletError(
        'Network changed. Please connect your wallet again on Hardhat Local.'
      )
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener(
        'accountsChanged',
        handleAccountsChanged
      )
      window.ethereum.removeListener(
        'chainChanged',
        handleChainChanged
      )
    }
  }, [])

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      category === 'All Events' || event.category === category

    const matchesSearch =
      `${event.title} ${event.city} ${event.category}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesCity =
      city === 'All Cities' || event.city === city

    return matchesCategory && matchesSearch && matchesCity
  })

  function openBooking(event) {
    setSelectedEvent(event)
    setQuantity(1)
    setBookingMessage('')
  }

  const loadMyTickets = useCallback(async () => {
    if (!contract || !walletAddress) {
      setMyTickets([])
      return
    }

    setIsLoadingTickets(true)
    setTicketsError('')

    try {
      const total = Number(await contract.ticketCount())
      const found = []

      for (let id = 1; id <= total; id += 1) {
        const ticket = await contract.tickets(id)

        if (
          ticket.buyer.toLowerCase() === walletAddress.toLowerCase()
        ) {
          const eventId = Number(ticket.eventId)
          const listing = events.find(
            (item) => item.contractEventId === eventId
          )

          found.push({
            id,
            eventId,
            eventName: listing?.title || `Event #${eventId}`,
            cancelled: ticket.cancelled,
            refunded: ticket.refunded,
          })
        }
      }

      setMyTickets(found.reverse())
    } catch (error) {
      console.error('TICKET REFRESH ERROR:', error)
      // A read failure must not make a confirmed transaction look failed.
      setTicketsError(
        error?.shortMessage ||
          error?.reason ||
          error?.message ||
          'Could not refresh your ticket list. Transaction status is unchanged.'
      )
    } finally {
      setIsLoadingTickets(false)
    }
  }, [contract, walletAddress])

  useEffect(() => {
    if (contract && walletAddress) {
      loadMyTickets()
    }
  }, [contract, walletAddress, loadMyTickets])

  async function confirmDemoBooking() {
    if (!selectedEvent) return

    if (getEventStatus(selectedEvent) !== 'upcoming') {
      setBookingMessage(
        'Ticket booking is available only before the event starts.'
      )
      return
    }

    if (!walletAddress || !contract) {
      setBookingMessage(
        'Connect MetaMask to Hardhat Local before booking.'
      )
      return
    }

    setIsBooking(true)
    setBookingMessage(
      'Please confirm the transaction in MetaMask.'
    )

    try {
      const eventId = selectedEvent.contractEventId
      const onChainEvent = await contract.events(eventId)

      if (!onChainEvent.active) {
        throw new Error(
          `On-chain event #${eventId} is inactive or does not exist.`
        )
      }

      if (
        Number(onChainEvent.eventDate) <=
        Math.floor(Date.now() / 1000)
      ) {
        throw new Error(
          'The on-chain event has started or its date has passed. Check the event dates.'
        )
      }

      const remaining = Number(
        onChainEvent.totalTickets - onChainEvent.ticketsSold
      )

      if (quantity > remaining) {
        throw new Error(
          `Only ${remaining} ticket(s) remain on-chain.`
        )
      }

      if (onChainEvent.ticketPrice <= 0n) {
        throw new Error('The on-chain ticket price is zero.')
      }

      if (typeof contract.bookTickets !== 'function') {
        throw new Error(
          'Bulk booking is unavailable in the deployed contract.'
        )
      }

      // Always use the deployed contract's actual ticket price.
      const totalPayment =
        onChainEvent.ticketPrice * BigInt(quantity)

      const paymentEth = ethers.formatEther(totalPayment)

      setBookingMessage(
        `Confirm ${quantity} ticket(s), total ${paymentEth} ETH, in MetaMask.`
      )

      const transaction = await contract.bookTickets(
        eventId,
        quantity,
        { value: totalPayment }
      )

      setBookingMessage(
        'Transaction submitted. Waiting for confirmation...'
      )

const receipt = await transaction.wait()

console.log('Booking transaction hash:', transaction.hash)
console.log('Booking receipt status:', receipt?.status)

if (receipt?.status !== 1) {
  throw new Error(
    `Booking transaction failed. Hash: ${transaction.hash}`
  )
}

console.log('Booking confirmed successfully:', transaction.hash)
      setBookingMessage(
        `Booking confirmed on blockchain! ${quantity} ticket(s), ${paymentEth} ETH. Transaction: ${transaction.hash}`
      )

      // Refresh is separate from the confirmed transaction result.
      await loadMyTickets()
    } catch (error) {
      console.error('BOOKING ERROR:', error)
      setBookingMessage(
        error?.code === 'ACTION_REJECTED'
          ? 'Transaction cancelled in MetaMask. No booking was made.'
          : error?.reason ||
            error?.shortMessage ||
            error?.info?.error?.message ||
            error?.message ||
            'Booking transaction failed.'
      )
    } finally {
      setIsBooking(false)
    }
  }

  async function cancelMyTicket(ticketId) {
    if (!contract) {
      setWalletError(
        'Connect your wallet before cancelling a ticket.'
      )
      return
    }

    try {
      setBookingMessage(
        `Confirm cancellation of ticket #${ticketId} in MetaMask.`
      )

      const transaction = await contract.cancelTicket(ticketId)
const receipt = await transaction.wait()

if (receipt.status !== 1) {
  throw new Error(`Cancellation failed: ${transaction.hash}`)
}

console.log('Cancellation confirmed:', transaction.hash)
      setBookingMessage(
        `Ticket #${ticketId} cancellation and refund confirmed on blockchain. Transaction: ${transaction.hash}`
      )

      // Refresh errors are shown separately from cancellation/refund status.
      await loadMyTickets()
    } catch (error) {
      console.error('CANCELLATION ERROR:', error)
      setBookingMessage(
        error?.code === 'ACTION_REJECTED'
          ? 'Cancellation rejected in MetaMask. No cancellation was made.'
          : error?.shortMessage ||
            error?.reason ||
            error?.info?.error?.message ||
            error?.message ||
            'Cancellation transaction failed.'
      )
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="BlockSphere home">
          <span className="brand-icon">B</span>
          <span>
            Block<span className="brand-accent">Sphere</span>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#events">Explore</a>
          <a
            href="#my-tickets"
            onClick={() => setShowMyTickets(true)}
          >
            My tickets
          </a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <button className="wallet-button" onClick={connectWallet}>
          <span className="wallet-dot" />
          {walletAddress
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : 'Connect Wallet'}
        </button>
      </header>

      {walletError && (
        <p
          role="alert"
          style={{ textAlign: 'center', color: '#ff7777' }}
        >
          {walletError}
        </p>
      )}

      <main id="home">
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="live-dot" />
              YOUR NEXT EXPERIENCE STARTS HERE
            </div>

            <h1>
              Find your people.
              <br />
              <span>Feel the moment.</span>
            </h1>

            <p className="hero-description">
              Concerts, comedy, sports and more. Discover unforgettable
              experiences and book your tickets with blockchain-powered
              transparency.
            </p>

            <a className="primary-button" href="#events">
              Explore events <span>↗</span>
            </a>

            <div className="hero-stats">
              <div>
                <strong>ALL</strong>
                <span>YOUR FAVOURITE EVENTS</span>
              </div>
              <div>
                <strong>SECURE</strong>
                <span>BLOCKCHAIN TICKETING</span>
              </div>
              <div>
                <strong>YOU</strong>
                <span>IN CONTROL</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <img
              key={heroSlides[heroSlideIndex].image}
              className="hero-slide-image"
              src={heroSlides[heroSlideIndex].image}
              alt={heroSlides[heroSlideIndex].alt}
            />

            <div className="hero-image-shade" />

            <div className="hero-slide-caption">
              <span className="hero-caption-kicker">
                DISCOVER SOMETHING UNFORGETTABLE
              </span>
              <h2>
                Live your moment<span>.</span>
              </h2>
              <p>Find the experiences worth remembering.</p>
            </div>

            <div className="hero-slide-dots" aria-label="Choose hero image">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  className={`hero-slide-dot ${index === heroSlideIndex ? 'active' : ''}`}
                  aria-label={`Show hero image ${index + 1}`}
                  aria-pressed={index === heroSlideIndex}
                  onClick={() => setHeroSlideIndex(index)}
                />
              ))}
            </div>
          </div>
        </section>

        {showMyTickets && (
          <section className="my-tickets-section" id="my-tickets">
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  YOUR BLOCKCHAIN RECORDS
                </span>
                <h2>
                  My <span>tickets.</span>
                </h2>
                <p>
                  View tickets associated with your connected wallet.
                </p>
              </div>

              <button
                className="book-button"
                onClick={loadMyTickets}
                disabled={!contract || isLoadingTickets}
              >
                {isLoadingTickets ? 'Loading...' : 'Refresh tickets'}
              </button>
            </div>

            {ticketsError && (
              <p role="alert" className="booking-message" style={{ overflowWrap: 'anywhere' }}>
                Ticket list refresh issue: {ticketsError}
              </p>
            )}

            {!walletAddress ? (
              <div className="empty-state">
                <h3>Connect your wallet</h3>
                <p>
                  Connect MetaMask to view your blockchain ticket records.
                </p>
              </div>
            ) : myTickets.length === 0 ? (
              <div className="empty-state">
                <h3>No tickets found</h3>
                <p>
                  Your booked tickets will appear here after a confirmed
                  blockchain transaction.
                </p>
              </div>
            ) : (
              <div className="my-tickets-list">
                {myTickets.map((ticket) => (
                  <article
                    className="my-ticket-card"
                    key={ticket.id}
                  >
                    <div>
                      <span className="section-kicker">
                        TICKET #{ticket.id}
                      </span>
                      <h3>{ticket.eventName}</h3>
                      <p>On-chain event ID: {ticket.eventId}</p>
                    </div>

                    <div className="my-ticket-actions">
                      <span
                        className={`ticket-status ${
                          ticket.cancelled
                            ? 'cancelled'
                            : 'confirmed'
                        }`}
                      >
                        {ticket.cancelled
                          ? 'Cancelled / Refunded'
                          : 'Confirmed'}
                      </span>

                      {!ticket.cancelled && (
                        <button
                          className="book-button"
                          onClick={() => cancelMyTicket(ticket.id)}
                          disabled={!contract}
                        >
                          Cancel ticket
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="events-section" id="events">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                DISCOVER SOMETHING NEW
              </span>
              <h2>
                Events worth <span>showing up for.</span>
              </h2>
              <p>Find the experience that feels like you.</p>
            </div>

            <div className="event-count">
              <strong>
                {filteredEvents.length.toString().padStart(2, '0')}
              </strong>
              <span>EVENTS FOUND</span>
            </div>
          </div>

          <div className="filters">
            <div className="category-list">
              {categories.map((item) => (
                <button
                  key={item}
                  className={`category-button ${
                    category === item ? 'active' : ''
                  }`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="search-controls">
              <label className="search-box">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              <select
                aria-label="Filter by city"
                className="city-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option>All Cities</option>
                <option>Mumbai</option>
                <option>Pune</option>
                <option>Nashik</option>
              </select>
            </div>
          </div>

          <div className="event-grid">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event, clockNow)

              return (
                <article className="event-card" key={event.id}>
                  <div className="event-image">
                    <img
                      src={event.image}
                      alt={event.title}
                      loading="lazy"
                    />

                    <span className="event-tag">
                      {status === 'live' ? 'LIVE' : event.tag}
                    </span>

                    <button
                      className={`favorite-button ${
                        favoriteEventIds.includes(event.id)
                          ? 'is-favorite'
                          : ''
                      }`}
                      aria-label={`${
                        favoriteEventIds.includes(event.id)
                          ? 'Remove'
                          : 'Save'
                      } ${event.title} ${
                        favoriteEventIds.includes(event.id)
                          ? 'from'
                          : 'to'
                      } favourites`}
                      aria-pressed={favoriteEventIds.includes(event.id)}
                      onClick={() => toggleFavorite(event.id)}
                      title={
                        favoriteEventIds.includes(event.id)
                          ? 'Remove from favourites'
                          : 'Add to favourites'
                      }
                    >
                      {favoriteEventIds.includes(event.id) ? '♥' : '♡'}
                    </button>
                  </div>

                  <div className="event-info">
                    <span className="event-category">
                      {event.category}
                    </span>
                    <h3>{event.title}</h3>

                    <div className="event-meta">
                      <span>◷ {formatEventDate(event)}</span>
                      <span>⌖ {event.city}</span>
                    </div>

                    <div className="event-card-bottom">
                      <div className="price">
                        <span>
                          {status === 'ended'
                            ? 'Event has ended'
                            : status === 'live'
                              ? 'Event is live'
                              : 'Starting from'}
                        </span>
                        <strong>
                          ₹{event.price.toLocaleString('en-IN')}
                        </strong>
                      </div>

                      <button
                        className="book-button"
                        onClick={() => openBooking(event)}
                        disabled={status !== 'upcoming'}
                        aria-label={
                          status === 'ended'
                            ? `${event.title} has ended`
                            : status === 'live'
                              ? `${event.title} is live; booking is closed`
                              : `Book tickets for ${event.title}`
                        }
                        title={
                          status === 'ended'
                            ? 'This event has ended'
                            : status === 'live'
                              ? 'Booking closes when the event starts'
                              : 'Book tickets'
                        }
                      >
                        {status === 'ended'
                          ? 'Event ended'
                          : status === 'live'
                            ? 'Event live'
                            : 'Book now'}
                        {status === 'upcoming' && <span> ↗</span>}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="empty-state">
              <span>⌕</span>
              <h3>No events found</h3>
              <p>Try another search, category or city.</p>
              <button
                className="primary-button"
                onClick={() => {
                  setSearch('')
                  setCategory('All Events')
                  setCity('All Cities')
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section className="blockchain-banner" id="how-it-works">
          <div className="banner-symbol">⬡</div>
          <div>
            <span className="section-kicker">
              TICKETING, REIMAGINED
            </span>
            <h2>
              More than a ticket. <span>It's yours.</span>
            </h2>
            <p>
              Blockchain helps make ticket ownership verifiable and
              ticket operations more transparent.
            </p>
          </div>
          <div className="banner-points">
            <span>✦ Verifiable tickets</span>
            <span>✦ Transparent records</span>
            <span>✦ Clear cancellation policies</span>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href="#home">
          <span className="brand-icon">B</span>
          <span>
            Block<span className="brand-accent">Sphere</span>
          </span>
        </a>
        <p>Discover events. Make memories. Book with confidence.</p>
        <span className="footer-note">
          A blockchain mini-project prototype
        </span>
      </footer>

      {selectedEvent && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isBooking) {
              setSelectedEvent(null)
            }
          }}
        >
          <div
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
          >
            <button
              className="modal-close"
              onClick={() => !isBooking && setSelectedEvent(null)}
              aria-label="Close booking"
              disabled={isBooking}
            >
              ×
            </button>

            <span className="section-kicker">
              YOUR NEXT EXPERIENCE
            </span>
            <h2 id="booking-title">{selectedEvent.title}</h2>
            <p className="modal-meta">
              {formatEventDate(selectedEvent)} · {selectedEvent.city}
            </p>

            {getEventStatus(selectedEvent, clockNow) !== 'upcoming' ? (
              <div
                role="alert"
                style={{
                  margin: '20px 0',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 90, 90, 0.10)',
                  border: '1px solid rgba(255, 90, 90, 0.35)',
                  color: '#ff8585',
                  lineHeight: 1.6,
                }}
              >
                <strong>
                  {getEventStatus(selectedEvent, clockNow) === 'ended'
                    ? 'Event ended'
                    : 'Event is live'}
                </strong>
                <p style={{ margin: '6px 0 0' }}>
                  {getEventStatus(selectedEvent, clockNow) === 'ended'
                    ? 'This event has finished. Ticket booking is closed.'
                    : 'This event has already started. Ticket booking is closed.'}
                </p>
              </div>
            ) : (
              <>
                <div className="quantity-row">
                  <div>
                    <strong>Tickets</strong>
                    <span>
                      ₹{selectedEvent.price.toLocaleString('en-IN')} per
                      ticket (display price)
                    </span>
                  </div>

                  <div className="quantity-control">
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.max(1, q - 1))
                      }
                      disabled={quantity <= 1 || isBooking}
                      aria-label="Decrease ticket quantity"
                    >
                      −
                    </button>
                    <strong>{quantity}</strong>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(10, q + 1))
                      }
                      disabled={quantity >= 10 || isBooking}
                      aria-label="Increase ticket quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="total-row">
                  <span>Total display price</span>
                  <strong>
                    ₹{(selectedEvent.price * quantity).toLocaleString('en-IN')}
                  </strong>
                </div>

                <div className="demo-notice" style={{ lineHeight: 1.6 }}>
                  <p>
                    <strong>Blockchain price:</strong>{' '}
                    {selectedEvent.chainPriceEth} ETH per ticket.
                  </p>
                  <p>
                    INR amounts are for display only. The actual ETH amount
                    is calculated from the deployed smart contract and shown
                    before you confirm the transaction in MetaMask.
                  </p>
                </div>
              </>
            )}

            {bookingMessage && (
              <p
                className="booking-message"
                role="status"
                style={{ overflowWrap: 'anywhere' }}
              >
                {bookingMessage}
              </p>
            )}

            <button
              className="primary-button modal-book"
              onClick={confirmDemoBooking}
              disabled={
                isBooking ||
                getEventStatus(selectedEvent, clockNow) !== 'upcoming'
              }
              style={
                isBooking ||
                getEventStatus(selectedEvent, clockNow) !== 'upcoming'
                  ? { opacity: 0.55, cursor: 'not-allowed' }
                  : undefined
              }
            >
              {isBooking
                ? 'Processing transaction...'
                : getEventStatus(selectedEvent, clockNow) === 'ended'
                  ? 'Event ended'
                  : getEventStatus(selectedEvent, clockNow) === 'live'
                    ? 'Event live'
                    : 'Book on blockchain'}
              {!isBooking &&
                getEventStatus(selectedEvent, clockNow) === 'upcoming' && (
                  <span> ↗</span>
                )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App