import { User } from "../models";
import { hashPassword, comparePassword, createSession, destroySession } from "../middleware/auth";

export class AuthService {
  async login(email: string, password: string) {
    const user = await User.findOne({ email });

    if (!user || user.isDeleted) {
      return { error: "Invalid credentials", status: 401 };
    }

    if (!user.isActive) {
      return { error: "Account is deactivated", status: 403 };
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return { error: "Account locked. Try again later.", status: 423 };
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      const update: any = { failedLoginAttempts: attempts };
      if (attempts >= 5) {
        update.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await User.findByIdAndUpdate(user._id, update);
      return { error: "Invalid credentials", status: 401 };
    }

    await User.findByIdAndUpdate(user._id, { failedLoginAttempts: 0, lockUntil: null });
    const token = createSession(user._id.toString());
    const safeUser = user.toJSON();
    delete safeUser.password;
    return { token, user: safeUser };
  }

  getCurrentUser(user: any) {
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  logout(token: string) {
    destroySession(token);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await User.findById(userId);
    if (!user) return { error: "User not found", status: 404 };

    const valid = await comparePassword(oldPassword, user.password);
    if (!valid) return { error: "Current password is incorrect", status: 400 };

    const hashedPassword = await hashPassword(newPassword);
    await User.findByIdAndUpdate(userId, { password: hashedPassword, mustChangePassword: false });
    return { success: true };
  }
}

export const authService = new AuthService();
