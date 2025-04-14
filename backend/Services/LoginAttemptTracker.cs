using System.Collections.Concurrent;

namespace TTH.Backend.Services
{
    public class LoginAttemptTracker
    {
        private readonly ConcurrentDictionary<string, LoginAttemptInfo> _loginAttempts = new();
        private const int MaxAttempts = 5;
        private const int LockoutMinutes = 15;

        private class LoginAttemptInfo
        {
            public int FailedAttempts { get; set; }
            public DateTime? LockoutEnd { get; set; }
        }

        public bool IsLockedOut(string email)
        {
            if (_loginAttempts.TryGetValue(email, out var info))
            {
                if (info.LockoutEnd.HasValue && DateTime.UtcNow < info.LockoutEnd.Value)
                {
                    return true;
                }
                if (info.LockoutEnd.HasValue && DateTime.UtcNow >= info.LockoutEnd.Value)
                {
                    // Reset if lockout period is over
                    Reset(email);
                }
            }
            return false;
        }

        public TimeSpan? GetRemainingLockoutTime(string email)
        {
            if (_loginAttempts.TryGetValue(email, out var info) && info.LockoutEnd.HasValue)
            {
                var remaining = info.LockoutEnd.Value - DateTime.UtcNow;
                return remaining.TotalSeconds > 0 ? remaining : null;
            }
            return null;
        }

        public void IncrementFailedAttempt(string email)
        {
            var info = _loginAttempts.AddOrUpdate(
                email,
                new LoginAttemptInfo { FailedAttempts = 1 },
                (_, existing) =>
                {
                    existing.FailedAttempts++;
                    if (existing.FailedAttempts >= MaxAttempts)
                    {
                        existing.LockoutEnd = DateTime.UtcNow.AddMinutes(LockoutMinutes);
                    }
                    return existing;
                });
        }

        public void Reset(string email)
        {
            _loginAttempts.TryRemove(email, out _);
        }
    }
}