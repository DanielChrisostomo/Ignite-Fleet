import { forwardRef } from 'react';
import { TextInputProps, TextInput } from 'react-native';
import { Container, Input, Label } from './styles';
import { useTheme } from 'styled-components/native';

type Props = TextInputProps & {
 label: string
}

const LicensePlateInput = forwardRef<TextInput, Props>(({ label, ...rest }, ref) => {

    const { COLORS } = useTheme()

  return (
    <Container>
        <Label>
          {label}
        </Label>

        <Input 
        ref={ref} 
        maxLength={7} 
        autoCapitalize='characters' 
        placeholderTextColor={COLORS.GRAY_400} 
        {...rest} 
        />
    </Container>
  );
})

export { LicensePlateInput }