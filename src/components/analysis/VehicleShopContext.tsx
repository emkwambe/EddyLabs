import { VehicleInfo, ShopInfo } from '@/lib/types'
import { Car, Wrench, Phone, MapPin } from 'lucide-react'

interface VehicleShopContextProps {
  vehicleInfo?: VehicleInfo | null
  shopInfo?: ShopInfo | null
}

export function VehicleShopContext({ vehicleInfo, shopInfo }: VehicleShopContextProps) {
  // Don't render if neither vehicle nor shop info exists
  if (!vehicleInfo && !shopInfo) {
    return null
  }

  const hasVehicle = vehicleInfo && (vehicleInfo.year || vehicleInfo.make || vehicleInfo.model || vehicleInfo.mileage)
  const hasShop = shopInfo && (shopInfo.name || shopInfo.address || shopInfo.phone)

  if (!hasVehicle && !hasShop) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Vehicle Info */}
      {hasVehicle && (
        <div className="flex items-start space-x-3 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <Car className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-primary-900 mb-1">
              Vehicle
            </h3>
            <div className="text-sm text-primary-700">
              {vehicleInfo.year && vehicleInfo.make && vehicleInfo.model ? (
                <p className="font-medium">
                  {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                </p>
              ) : (
                <>
                  {vehicleInfo.year && <span>{vehicleInfo.year} </span>}
                  {vehicleInfo.make && <span>{vehicleInfo.make} </span>}
                  {vehicleInfo.model && <span>{vehicleInfo.model}</span>}
                </>
              )}
              {vehicleInfo.mileage && (
                <p className="text-xs text-primary-600 mt-1">
                  {vehicleInfo.mileage.toLocaleString()} miles
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shop Info */}
      {hasShop && (
        <div className="flex items-start space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <Wrench className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Repair Shop
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              {shopInfo.name && (
                <p className="font-medium">{shopInfo.name}</p>
              )}
              {shopInfo.address && (
                <p className="flex items-center text-xs text-gray-600">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{shopInfo.address}</span>
                </p>
              )}
              {shopInfo.phone && (
                <p className="flex items-center text-xs text-gray-600">
                  <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                  <a
                    href={`tel:${shopInfo.phone}`}
                    className="hover:text-primary-600 hover:underline"
                  >
                    {shopInfo.phone}
                  </a>
                </p>
              )}
              {shopInfo.zip_code && !shopInfo.address && (
                <p className="text-xs text-gray-600">
                  ZIP: {shopInfo.zip_code}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
