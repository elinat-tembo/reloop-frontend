export const LOCATIONS = {
  'Lusaka Province': ['Lusaka', 'Kafue', 'Chongwe', 'Chilanga'],
  'Copperbelt Province': ['Ndola', 'Kitwe', 'Chingola', 'Mufulira', 'Luanshya'],
  'Southern Province': ['Livingstone', 'Choma', 'Mazabuka', 'Monze'],
  'Other Provinces': ['Kabwe', 'Chipata', 'Kasama', 'Solwezi'],
}

export const REGIONS = Object.keys(LOCATIONS)

export const CITIES = Object.values(LOCATIONS).flat()
