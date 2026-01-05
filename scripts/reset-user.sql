-- Delete the existing user to force recreation with proper defaults
DELETE FROM User WHERE email = 'tiago@example.com';
