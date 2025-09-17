// /presentation/components/auth/AuthFormRegister.tsx
import React, { useState } from 'react';
import { IRegisterForm } from '@/application/dtos/auth/register/register/RegisterRequest';
import { registerSchema } from '@/domain/validations/auth/RegisterValidation';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import FormField from '../forms/FormField';
import Button from '../../atoms/button/SimpleButton';
import Loader from '../../atoms/loader/SimpleLoader';
import { DropDownMenuForm, IOption } from '../common/DropDownMenuForm';
import { useRoles } from '@/application/useCases/users/useRoles';
import FaceEnrollWithMesh from '../common/FaceEnrollWithMesh';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';

interface RegisterFormProps {
  onSubmit: (data: IRegisterForm, faceVectors: number[][]) => void; // ⬅️ ahora envía ambos
  isLoading?: boolean;
}

const FACE_SHOTS_REQUIRED = 3;

const AuthFormRegister = ({ onSubmit, isLoading = false }: RegisterFormProps) => {
  const [isFaceEnroll, setIsFaceEnroll] = useState(false);
  const [capturedVectors, setCapturedVectors] = useState<number[][]>([]);
  const [disabled, setDisabled] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useFormValidation(registerSchema({ isAdmin: false }), false, {
    email: '',
    password: '',
    password_confirm: '',
    role_id: '1',
  });

  const {
    roles,
    isLoading: isRolesLoading,
    error: isRolesError,
  } = useRoles(setDisabled);

  const isFaceReady = capturedVectors.length >= FACE_SHOTS_REQUIRED;
  const isSubmitDisabled = isLoading || isRolesLoading || !isValid || !isFaceReady;

  const onSubmitInternal = handleSubmit((form) => {
    if (!isFaceReady) {
      setIsFaceEnroll(true);
      SnackbarUtilities.error(
        `Debes capturar ${FACE_SHOTS_REQUIRED} tomas del rostro.`,
        'top',
        'center'
      );
      return;
    }
    onSubmit(form, capturedVectors);
  });

  

  return (
    <form onSubmit={onSubmitInternal} className="space-y-4">
      <FormField name="email" label="Correo" control={control} type="email" placeholder="Ingresa tu correo" />
      <FormField name="password" label="Contraseña" control={control} type="password" placeholder="Ingresa tu contraseña" />
      <FormField name="password_confirm" label="Confirmar contraseña" control={control} type="password" placeholder="Confirma tu contraseña" />

      <DropDownMenuForm
        label="Selecciona tu rol"
        name="role_id"
        control={control}
        options={roles.data as IOption[]}
        defaultValue="Selecciona un rol"
      />

      {/* Registro facial obligatorio */}
      <div className="pt-2 border-t">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium">Registro facial (obligatorio)</h3>
            <p className="text-xs opacity-70">
              Capturas: {capturedVectors.length}/{FACE_SHOTS_REQUIRED}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded ${
                isFaceReady ? 'bg-emerald-600 text-white' : 'bg-gray-200'
              }`}
            >
              {isFaceReady ? 'Rostro listo ✓' : 'Pendiente'}
            </span>
            <Button type="button" variant="primary" onClick={() => setIsFaceEnroll(true)}>
              Registrar rostro
            </Button>
          </div>
        </div>

        {isFaceEnroll && (
          <FaceEnrollWithMesh
            open={isFaceEnroll}
            onClose={() => setIsFaceEnroll(false)}
            onComplete={({ descriptors }) => {
              setCapturedVectors(descriptors);
              SnackbarUtilities.success('Rostro capturado correctamente', 'top', 'center');
            }}
          />
        )}
      </div>

      <Button fullWidth variant="primary" type="submit" disabled={isSubmitDisabled}>
        {(isLoading || isRolesLoading) && !isRolesError ? <Loader color="primary" /> : 'Registrarse'}
      </Button>
    </form>
  );
};

export default AuthFormRegister;
