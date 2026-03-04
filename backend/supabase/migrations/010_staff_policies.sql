-- =========================
-- STAFF POLICIES
-- =========================

-- Allow everyone to view profiles (needed for searching users)
-- or at least staff should view all
DROP POLICY IF EXISTS "Staff view all profiles" ON profiles;
CREATE POLICY "Staff view all profiles"
ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid() AND p.role = 'staff'
  )
);

-- Allow staff to view all loans
DROP POLICY IF EXISTS "Staff view all loans" ON loans;
CREATE POLICY "Staff view all loans"
ON loans
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid() AND p.role = 'staff'
  )
);

-- Allow staff to update all loans (for returns and renewals)
DROP POLICY IF EXISTS "Staff update all loans" ON loans;
CREATE POLICY "Staff update all loans"
ON loans
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid() AND p.role = 'staff'
  )
);

-- Allow staff to view all fines
DROP POLICY IF EXISTS "Staff view all fines" ON fines;
CREATE POLICY "Staff view all fines"
ON fines
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid() AND p.role = 'staff'
  )
);

-- Allow staff to manage all fines (for payments)
DROP POLICY IF EXISTS "Staff manage all fines" ON fines;
CREATE POLICY "Staff manage all fines"
ON fines
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid() AND p.role = 'staff'
  )
);

-- Allow staff to manage all reservations
DROP POLICY IF EXISTS "Staff manage all reservations" ON reservations;
CREATE POLICY "Staff manage all reservations"
ON reservations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid() AND p.role = 'staff'
  )
);
