import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Input from '../ui/Input';
import Button from '../ui/Button';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }
    setError('');
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Error al registrar tu cuenta. Verificá los datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre o Alias"
        name="name"
        required
        value={formData.name}
        onChange={handleChange}
        placeholder="Ej: Laura C."
      />
      <Input
        label="Correo Electrónico"
        type="email"
        name="email"
        required
        value={formData.email}
        onChange={handleChange}
        placeholder="laura@ejemplo.com"
      />
      <Input
        label="Teléfono / WhatsApp (Opcional)"
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Ej: 351 000 0000"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Contraseña"
          type="password"
          name="password"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
        />
        <Input
          label="Confirmar"
          type="password"
          name="confirmPassword"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="text-xs text-status-error bg-status-error-bg p-2.5 rounded border border-status-error-border font-medium">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="md"
        loading={loading}
        className="mt-2 py-2.5 text-xs sm:text-sm"
      >
        Crear mi Cuenta
      </Button>

      <div className="text-center text-xs text-content-secondary pt-3 border-t border-border-subtle">
        ¿Ya tenés una cuenta?{' '}
        <Link to="/login" className="text-brand-deep font-semibold hover:underline transition-colors">
          Iniciá sesión acá
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
