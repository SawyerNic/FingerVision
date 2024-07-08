import { AddressAutofill } from '@mapbox/search-js-react';

const MyAddressForm = () => {
  return (
    <form>
      <AddressAutofill
        accessToken='YOUR_MAPBOX_ACCESS_TOKEN'
      >
        <input type="text" name="address-1" autoComplete="address-line1" />
        <input type="text" name="address-2" autoComplete="address-line2" />
        <input type="text" name="city" autoComplete="address-level2" />
        <input type="text" name="state" autoComplete="address-level1" />
        <input type="text" name="zip" autoComplete="postal-code" />
      </AddressAutofill>
    </form>
  )
}

export default MyAddressForm