import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { useQuery } from '../../libs/realm';

import { CarStatus } from '../../components/CarStatus';
import { HomeHeader } from '../../components/HomeHeader';

import { Container, Content } from './styles';
import { Historic } from '../../libs/realm/schemas/Historic';
import { Alert } from 'react-native';

export function Home() {
  const [vehicleInUse, setVehicleInUse] = React.useState<Historic | null>(null)

  const { navigate } = useNavigation() 

  const historic = useQuery(Historic)

  function handleRegisterMovement() {
    if(vehicleInUse?._id){
      navigate("arrival", { id: vehicleInUse?._id.toString() })
    } else {
      navigate("departure")
    }
  }

  function fetchVehicle() {
    try {
      const vehicle = historic.filtered("status = 'departure'")[0]
      setVehicleInUse(vehicle)
    } catch (error) {
      Alert.alert("Veículo em uso", "Não foi possível carregar o veículo em uso.")
      console.log(error)
    }
  }

  React.useEffect(() => {
    fetchVehicle()
  }, [])
  

  return (
    <Container>
      <HomeHeader />

      <Content>
        <CarStatus 
        licensePlate={vehicleInUse?.license_plate}
        onPress={handleRegisterMovement} 
        />
      </Content>
    </Container>
  );
}