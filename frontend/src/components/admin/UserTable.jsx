import React from 'react';
import { FiEdit2, FiTrash2, FiShield, FiUser, FiShoppingBag } from 'react-icons/fi';

const UserTable = ({ users, currentUserId, onEdit, onDelete }) => {
  return (
    <div>
      {/* Mobile Card List (screens < 768px) */}
      <div className="md:hidden space-y-3">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          const isAdmin = user.role === 'ADMIN';
          const orderCount = user._count?.orders ?? 0;
          const registeredDate = user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : '-';

          return (
            <div
              key={user.id}
              className="bg-surface p-4 rounded-lg border border-border shadow-soft flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${
                      isAdmin
                        ? 'bg-brand text-white'
                        : 'bg-surface-elevated text-content border border-border'
                    }`}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-content leading-tight">
                        {user.name}
                      </h4>
                      {isCurrentUser && (
                        <span className="text-[10px] bg-surface-elevated text-brand-deep font-semibold px-1.5 py-0.5 rounded border border-border">
                          Vos
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-content-secondary mt-0.5">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-content-secondary mt-0.5 font-mono">
                        {user.phone}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-brand text-white'
                      : 'bg-surface-elevated text-content-secondary border border-border'
                  }`}
                >
                  {isAdmin ? <FiShield className="text-[10px]" /> : <FiUser className="text-[10px]" />}
                  <span>{isAdmin ? 'Admin' : 'Cliente'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border-subtle text-xs">
                <div className="flex items-center space-x-3 text-content-secondary">
                  <span className="flex items-center space-x-1">
                    <FiShoppingBag className="text-brand-deep" />
                    <span>{orderCount} pedidos</span>
                  </span>
                  <span>&bull;</span>
                  <span>Reg: {registeredDate}</span>
                </div>

                <div className="flex space-x-1.5">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-1.5 bg-surface-elevated hover:bg-brand text-content hover:text-white rounded transition-colors border border-border-strong"
                    title="Modificar usuario y rol"
                  >
                    <FiEdit2 size={13} />
                  </button>
                  <button
                    disabled={isCurrentUser}
                    onClick={() => {
                      if (
                        window.confirm(
                          `¿Estás seguro de que querés eliminar al usuario ${user.name} (${user.email})?`
                        )
                      ) {
                        onDelete(user.id, user.name);
                      }
                    }}
                    className={`p-1.5 rounded transition-colors ${
                      isCurrentUser
                        ? 'opacity-30 cursor-not-allowed text-content-secondary bg-canvas'
                        : 'bg-status-error-bg hover:bg-rose-600 text-status-error hover:text-white border border-status-error-border'
                    }`}
                    title={isCurrentUser ? 'No podés eliminar tu propia cuenta' : 'Eliminar usuario'}
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Data Table */}
      <div className="hidden md:block bg-surface rounded-lg border border-border shadow-soft overflow-hidden">
        <table className="min-w-full divide-y divide-border text-left">
          <thead className="bg-surface-elevated text-[11px] font-bold text-content uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Usuario</th>
              <th className="px-5 py-3">Teléfono</th>
              <th className="px-5 py-3">Rol</th>
              <th className="px-5 py-3">Pedidos</th>
              <th className="px-5 py-3">Fecha Registro</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-xs">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const isAdmin = user.role === 'ADMIN';
              const orderCount = user._count?.orders ?? 0;
              const registeredDate = user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : '-';

              return (
                <tr key={user.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isAdmin
                            ? 'bg-brand text-white'
                            : 'bg-surface-elevated text-content border border-border'
                        }`}
                      >
                        {user.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-content">{user.name}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-surface-elevated text-brand-deep font-semibold px-1.5 py-0.5 rounded border border-border">
                              Vos
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-content-secondary">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-content-secondary">
                    {user.phone || '-'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        isAdmin
                          ? 'bg-brand text-white'
                          : 'bg-surface-elevated text-content-secondary border border-border'
                      }`}
                    >
                      {isAdmin ? <FiShield className="text-[10px]" /> : <FiUser className="text-[10px]" />}
                      <span>{isAdmin ? 'Admin' : 'Cliente'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-content">
                    {orderCount}
                  </td>
                  <td className="px-5 py-3.5 text-content-secondary">{registeredDate}</td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-content-secondary hover:text-brand-deep p-1"
                      title="Editar usuario"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      disabled={isCurrentUser}
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Estás seguro de que querés eliminar al usuario ${user.name} (${user.email})?`
                          )
                        ) {
                          onDelete(user.id, user.name);
                        }
                      }}
                      className={`p-1 ${
                        isCurrentUser
                          ? 'opacity-20 cursor-not-allowed text-content-secondary'
                          : 'text-content-secondary hover:text-status-error'
                      }`}
                      title={isCurrentUser ? 'No podés eliminar tu propia cuenta' : 'Eliminar usuario'}
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
