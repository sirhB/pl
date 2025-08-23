import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartProvider, useCart, CartItem } from '@/contexts/cart-context'

// Test wrapper component
const TestComponent = () => {
  const { state, addItem, removeItem, updateQuantity, clearCart } = useCart()

  const testItem: Omit<CartItem, 'quantity'> = {
    id: 'test-item-1',
    name: 'Gold Chiavari Chair',
    category: 'Seating',
    price: 8.50,
    image: '/images/chairs/gold-chiavari.jpg',
    description: 'Elegant gold chiavari chair perfect for weddings',
    availability: 'available'
  }

  return (
    <div>
      <div data-testid="cart-total-items">{state.totalItems}</div>
      <div data-testid="cart-subtotal">{state.subtotal}</div>
      <div data-testid="cart-items-count">{state.items.length}</div>
      
      <button 
        data-testid="add-item-btn"
        onClick={() => addItem(testItem)}
      >
        Add Item
      </button>
      
      <button 
        data-testid="remove-item-btn"
        onClick={() => removeItem('test-item-1')}
      >
        Remove Item
      </button>
      
      <button 
        data-testid="update-quantity-btn"
        onClick={() => updateQuantity('test-item-1', 3)}
      >
        Update Quantity
      </button>
      
      <button 
        data-testid="clear-cart-btn"
        onClick={clearCart}
      >
        Clear Cart
      </button>

      {state.items.map(item => (
        <div key={item.id} data-testid={`cart-item-${item.id}`}>
          <span data-testid={`item-name-${item.id}`}>{item.name}</span>
          <span data-testid={`item-quantity-${item.id}`}>{item.quantity}</span>
          <span data-testid={`item-price-${item.id}`}>{item.price}</span>
        </div>
      ))}
    </div>
  )
}

const renderWithCartProvider = (component: React.ReactElement) => {
  return render(
    <CartProvider>
      {component}
    </CartProvider>
  )
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Initial State', () => {
    test('should initialize with empty cart', () => {
      renderWithCartProvider(<TestComponent />)
      
      expect(screen.getByTestId('cart-total-items')).toHaveTextContent('0')
      expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('0')
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0')
    })
  })

  describe('Adding Items', () => {
    test('should add item to cart', async () => {
      const user = userEvent.setup()
      renderWithCartProvider(<TestComponent />)
      
      await user.click(screen.getByTestId('add-item-btn'))
      
      expect(screen.getByTestId('cart-total-items')).toHaveTextContent('1')
      expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('8.5')
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1')
      expect(screen.getByTestId('cart-item-test-item-1')).toBeInTheDocument()
    })

    test('should increase quantity when adding existing item', async () => {
      const user = userEvent.setup()
      renderWithCartProvider(<TestComponent />)
      
      // Add item twice
      await user.click(screen.getByTestId('add-item-btn'))
      await user.click(screen.getByTestId('add-item-btn'))
      
      expect(screen.getByTestId('cart-total-items')).toHaveTextContent('2')
      expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('17')
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1') // Still one unique item
      expect(screen.getByTestId('item-quantity-test-item-1')).toHaveTextContent('2')
    })
  })

  describe('Removing Items', () => {
    test('should remove item from cart', async () => {
      const user = userEvent.setup()
      renderWithCartProvider(<TestComponent />)
      
      // Add item first
      await user.click(screen.getByTestId('add-item-btn'))
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1')
      
      // Remove item
      await user.click(screen.getByTestId('remove-item-btn'))
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0')
      expect(screen.getByTestId('cart-total-items')).toHaveTextContent('0')
      expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('0')
    })
  })

  describe('Updating Quantity', () => {
    test('should update item quantity', async () => {
      const user = userEvent.setup()
      renderWithCartProvider(<TestComponent />)
      
      // Add item first
      await user.click(screen.getByTestId('add-item-btn'))
      
      // Update quantity
      await user.click(screen.getByTestId('update-quantity-btn'))
      
      expect(screen.getByTestId('item-quantity-test-item-1')).toHaveTextContent('3')
      expect(screen.getByTestId('cart-total-items')).toHaveTextContent('3')
      expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('25.5')
    })

    test('should remove item when quantity is 0', async () => {
      const user = userEvent.setup()
      renderWithCartProvider(<TestComponent />)
      
      // Add item first
      await user.click(screen.getByTestId('add-item-btn'))
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1')
      
      // Set quantity to 0
      const updateBtn = screen.getByTestId('update-quantity-btn')
      fireEvent.click(updateBtn)
      
      // Manually trigger update to 0
      const { container } = render(
        <CartProvider>
          <TestComponentWithZeroQuantity />
        </CartProvider>
      )
      
      // Item should be removed
      expect(screen.queryByTestId('cart-item-test-item-1')).not.toBeInTheDocument()
    })
  })

  describe('Clearing Cart', () => {
    test('should clear all items from cart', async () => {
      const user = userEvent.setup()
      renderWithCartProvider(<TestComponent />)
      
      // Add multiple items
      await user.click(screen.getByTestId('add-item-btn'))
      await user.click(screen.getByTestId('add-item-btn'))
      
      expect(screen.getByTestId('cart-total-items')).toHaveTextContent('2')
      
      // Clear cart
      await user.click(screen.getByTestId('clear-cart-btn'))
      
      expect(screen.getByTestId('cart-total-items')).toHaveTextContent('0')
      expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('0')
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0')
    })
  })

  describe('LocalStorage Persistence', () => {
    test('should save cart to localStorage', async () => {
      const user = userEvent.setup()
      renderWithCartProvider(<TestComponent />)
      
      await user.click(screen.getByTestId('add-item-btn'))
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'primelux-cart',
          expect.stringContaining('Gold Chiavari Chair')
        )
      })
    })

    test('should load cart from localStorage on mount', () => {
      const mockCartData = JSON.stringify([
        {
          id: 'test-item-1',
          name: 'Gold Chiavari Chair',
          category: 'Seating',
          price: 8.50,
          quantity: 2,
          image: '/images/chairs/gold-chiavari.jpg',
          description: 'Elegant gold chiavari chair',
          availability: 'available'
        }
      ])
      
      localStorage.setItem('primelux-cart', mockCartData)
      
      renderWithCartProvider(<TestComponent />)
      
      expect(screen.getByTestId('cart-total-items')).toHaveTextContent('2')
      expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('17')
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1')
    })
  })

  describe('Error Handling', () => {
    test('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      localStorage.getItem = jest.fn().mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      renderWithCartProvider(<TestComponent />)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading cart from localStorage:',
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })
})

// Helper component for testing zero quantity
const TestComponentWithZeroQuantity = () => {
  const { updateQuantity, state } = useCart()
  
  React.useEffect(() => {
    updateQuantity('test-item-1', 0)
  }, [updateQuantity])
  
  return <div data-testid="cart-items-count">{state.items.length}</div>
}

describe('useCart hook', () => {
  test('should throw error when used outside CartProvider', () => {
    const TestComponentOutsideProvider = () => {
      useCart()
      return <div>Test</div>
    }
    
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponentOutsideProvider />)
    }).toThrow('useCart must be used within a CartProvider')
    
    consoleSpy.mockRestore()
  })
})